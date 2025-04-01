import express from 'express';
import db from '../services/db.js';
import { sendTaskNotification, emailLimiterMiddleware } from '../services/emailService.js';
import { config } from '../../config/env.js';

const router = express.Router();
router.use(emailLimiterMiddleware);

/**
 * Generates a confirmed task number with sequential counting using the current date.
 * It searches for all task numbers ending with the current month/year combination
 * and then increments the highest number found.
 *
 * @returns {Promise<string>} - Formatted confirmed task number
 */
const generateConfirmedTaskNumber = async () => {
  // Always use current system date for the month/year component
  const currentDate = new Date();
  const month = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const year = currentDate.getFullYear().toString().slice(-2);
  const currentMonthYearPattern = `${month}/${year}`;

  // Important: Only find task numbers that EXACTLY match the current month/year
  // This is needed to ensure proper reset at month boundaries
  const [countResults] = await db.query(
    'SELECT task_number FROM aircraft_tasks WHERE task_number LIKE ? AND task_status = "confirmed"',
    [`%/${month}/${year}`]
  );

  let maxNumber = 0;

  // Process each task number to find the highest number for current month/year
  countResults.forEach(row => {
    const parts = row.task_number.split('/');
    if (parts.length === 3 && parts[1] === month && parts[2] === year) {
      // Extract only the numeric part (remove any non-digits)
      const numericPart = parts[0].replace(/\D+/g, '');
      if (numericPart && !isNaN(numericPart)) {
        const num = parseInt(numericPart, 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }
  });

  // Increment highest number or start at 001 if none found for this month
  const nextNumber = maxNumber + 1;
  return `${String(nextNumber).padStart(3, '0')}/${currentMonthYearPattern}`;
};

/**
 * Generates a task number based on the given prefix and the current system date.
 * Always uses current date for month/year regardless of date_of_flight.
 *
 * @param {string} prefix - The prefix to use (e.g. 'PROV', 'MIL', 'CIV')
 * @returns {string} - Formatted task number
 */
const generateTaskNumber = (prefix) => {
  // Always use current system date for month/year
  const currentDate = new Date();
  const month = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const year = currentDate.getFullYear().toString().slice(-2);
  return `${prefix}/${month}/${year}`;
};
/**
 * Get the appropriate task number based on status.
 * For confirmed tasks, generate a sequential confirmed number.
 * For provisional, civil, or military tasks, use the corresponding prefix.
 * IMPORTANT: For non-confirmed tasks, the current system date is used
 * for the month and year.
 *
 * @param {string} status - The task status
 * @param {string} date - The date in YYYY-MM-DD format (not used for non-confirmed tasks)
 * @returns {Promise<string>} - The generated task number
 */
const getTaskNumber = async (status) => {
  const prefixMap = {
    provisional: 'PROV',
    military: 'MIL',
    civil: 'CIV'
  };

  if (status === 'confirmed') {
    return await generateConfirmedTaskNumber();
  } else if (prefixMap[status]) {
    // Always use current system date for the month/year
    return generateTaskNumber(prefixMap[status]);
  }

  throw new Error('Invalid task status');
};

/**
 * Send a notification about a task
 * @param {string} action - The action performed (RECEIVED, UPDATED, CONFIRMED, REMOVED)
 * @param {Object} taskData - The task data
 */
const sendNotification = async (action, taskData) => {
  try {
    const recipients = config.taskNotificationRecipients.split(',');

    // Get the latest task data from the database if we have an ID (except for removals)
    let taskToSend = taskData;
    if (taskData.id && action !== 'REMOVED') {
      const [latestTasks] = await db.query('SELECT * FROM aircraft_tasks WHERE id = ?', [taskData.id]);
      if (latestTasks.length > 0) {
        taskToSend = latestTasks[0];
      }
    }

    await sendTaskNotification(
      recipients,
      `AIRCRAFT TASK ${action}`,
      taskToSend,
      taskToSend.authority || 'Unknown Authority'
    );
  } catch (error) {
    console.error(`Failed to send ${action} notification:`, error);
  }
};

// Fetch all tasks
router.get('/', async (req, res) => {
  try {
    const [tasks] = await db.query('SELECT * FROM aircraft_tasks ORDER BY date_of_flight DESC');
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Fetch tasks by date
router.get('/:date', async (req, res) => {
  const { date } = req.params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
  }

  try {
    const [tasks] = await db.query('SELECT * FROM aircraft_tasks WHERE date_of_flight = ?', [date]);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by date:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Add a new task
router.post('/', async (req, res) => {
  const {
    task_status,
    date_of_flight,
    aircraft_type,
    estimated_time_of_departure,
    route,
    purpose,
    crew,
    pax,
    occurrence_status,
    authority,
    affected_dates,
  } = req.body;

  if (!task_status || !date_of_flight || !aircraft_type) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    // Process affected_dates consistently
    let datesToProcess = [];

    if (affected_dates) {
      if (typeof affected_dates === 'string') {
        // Handle string format (comma-separated or JSON string)
        if (affected_dates.startsWith('[')) {
          // It's a JSON string
          try {
            datesToProcess = JSON.parse(affected_dates);
          } catch (e) {
            datesToProcess = [];
          }
        } else {
          // It's a comma-separated string
          datesToProcess = affected_dates
            .split(',')
            .map(date => date.trim())
            .filter(date => date);
        }
      } else if (Array.isArray(affected_dates)) {
        // It's already an array
        datesToProcess = affected_dates;
      }
    }

    // Validate the dates and convert to YYYY-MM-DD
    datesToProcess = datesToProcess
      .map(date => {
        try {
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
          return null;
        } catch (e) {
          return null;
        }
      })
      .filter(date => date);

    // If no valid affected dates, use the primary date
    if (datesToProcess.length === 0) {
      datesToProcess = [date_of_flight];
    }

    // Only generate a group_id if there are multiple dates
    const groupId = datesToProcess.length > 1 ? `GRP-${Date.now()}` : null;

    // Generate a task number that will be shared across all dates.
    // For non-confirmed tasks, we use the current date (via new Date()).
    const sharedTaskNumber = await getTaskNumber(task_status, date_of_flight);

    const results = [];

    for (const date of datesToProcess) {
      const [result] = await db.query(
        `INSERT INTO aircraft_tasks (
          task_status, task_number, date_of_flight, aircraft_type, estimated_time_of_departure,
          route, purpose, crew, pax, occurrence_status, authority, affected_dates, group_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task_status,
          sharedTaskNumber,
          date,
          aircraft_type,
          estimated_time_of_departure,
          route,
          purpose,
          crew,
          pax,
          occurrence_status || 'Pending',
          authority,
          JSON.stringify(datesToProcess), // Store as JSON string
          groupId,
        ]
      );

      results.push({
        id: result.insertId,
        task_number: sharedTaskNumber,
        task_status,
        date_of_flight: date,
        aircraft_type,
        estimated_time_of_departure,
        route,
        purpose,
        crew,
        pax,
        occurrence_status: occurrence_status || 'Pending',
        authority,
        affected_dates: datesToProcess,
        group_id: groupId
      });
    }

    res.status(201).json(results);

    // Send notification after response with the first task
    if (results.length > 0) {
      setTimeout(() => {
        sendNotification('RECEIVED', results[0]);
      }, 100);
    }
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Confirm task endpoint
router.post('/:id/confirm', async (req, res) => {
  const { id } = req.params;

  try {
    // Get current task for date information
    const [taskResult] = await db.query('SELECT * FROM aircraft_tasks WHERE id = ?', [id]);
    if (taskResult.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = taskResult[0];

    // Only confirm if the task is either provisional or military
    if (task.task_status !== 'provisional' && task.task_status !== 'military') {
      return res.status(400).json({ message: 'Only provisional or military tasks can be confirmed' });
    }

    // Generate confirmed task number using current system date
    const confirmedTaskNumber = await generateConfirmedTaskNumber();

    // First update the current task
    await db.query(
      'UPDATE aircraft_tasks SET task_status = "confirmed", task_number = ? WHERE id = ?',
      [confirmedTaskNumber, id]
    );

    // If this task belongs to a group, update all other tasks in the same group with the same confirmed number
    if (task.group_id) {
      await db.query(
        'UPDATE aircraft_tasks SET task_status = "confirmed", task_number = ? WHERE group_id = ? AND id != ?',
        [confirmedTaskNumber, task.group_id, id]
      );

      console.log(`Updated all tasks in group ${task.group_id} with task number ${confirmedTaskNumber}`);
    }

    // Fetch the updated task to return in the response
    const [updatedTasks] = await db.query('SELECT * FROM aircraft_tasks WHERE id = ?', [id]);
    const updatedTask = updatedTasks[0];

    res.status(200).json({
      message: 'Task confirmed successfully',
      taskNumber: confirmedTaskNumber,
      task_status: 'confirmed',
      task: updatedTask
    });

    // Send confirmation notification
    setTimeout(() => {
      sendNotification('CONFIRMED', updatedTask);
    }, 100);
  } catch (error) {
    console.error('Error confirming task:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedTask = req.body;

  try {
    // First, get the current task from the database
    const [currentTasks] = await db.query('SELECT * FROM aircraft_tasks WHERE id = ?', [id]);

    if (currentTasks.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const currentTask = currentTasks[0];

    // Check if task status is changing to something other than confirmed
    if (updatedTask.task_status &&
        updatedTask.task_status !== currentTask.task_status &&
        updatedTask.task_status !== 'confirmed') {

      // Generate a new task number based on the new status
      // Again, we use new Date() internally in getTaskNumber for current month/year
      const dateToUse = updatedTask.date_of_flight || currentTask.date_of_flight;
      updatedTask.task_number = await getTaskNumber(updatedTask.task_status, dateToUse);
    }

    // Special case: If changing TO confirmed status in edit,
    // we don't generate a new task number; we just update the status.
    if (updatedTask.task_status === 'confirmed' && currentTask.task_status !== 'confirmed') {
      // Keep the existing task number, just update the status
    }

    // Process affected_dates consistently
    if (updatedTask.affected_dates !== undefined) {
      let datesArray = [];

      if (updatedTask.affected_dates === '') {
        updatedTask.affected_dates = JSON.stringify([]);
      } else {
        try {
          // Handle as comma-separated string or JSON string
          if (typeof updatedTask.affected_dates === 'string') {
            if (updatedTask.affected_dates.startsWith('[')) {
              try {
                datesArray = JSON.parse(updatedTask.affected_dates);
              } catch (e) {
                datesArray = [];
              }
            } else {
              datesArray = updatedTask.affected_dates.split(',').map(date => date.trim());
            }
          } else if (Array.isArray(updatedTask.affected_dates)) {
            datesArray = updatedTask.affected_dates;
          }

          // Validate dates (format to YYYY-MM-DD)
          const validDates = datesArray
            .filter(date => date)
            .map(date => {
              const parsedDate = new Date(date);
              if (isNaN(parsedDate)) {
                return null;
              }
              return parsedDate.toISOString().split('T')[0];
            })
            .filter(date => date);
          updatedTask.affected_dates = JSON.stringify(validDates);
        } catch (e) {
          updatedTask.affected_dates = JSON.stringify([]);
        }
      }
    }

    // Update the task in the database
    await db.query('UPDATE aircraft_tasks SET ? WHERE id = ?', [updatedTask, id]);

    // Fetch the updated task to return in the response
    const [updatedTasks] = await db.query('SELECT * FROM aircraft_tasks WHERE id = ?', [id]);
    const responseTask = updatedTasks[0];

    res.status(200).json({
      message: 'Task updated successfully',
      task: responseTask
    });

    // Send update notification
    setTimeout(() => {
      sendNotification('UPDATED', responseTask);
    }, 100);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// DELETE: Remove a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the task before deleting it
    const [taskToDelete] = await db.query('SELECT * FROM aircraft_tasks WHERE id = ?', [id]);

    if (taskToDelete.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const deletedTask = taskToDelete[0];

    // Delete the task
    const [result] = await db.query('DELETE FROM aircraft_tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });

    // Send deletion notification with the task data we saved before deletion
    setTimeout(() => {
      sendNotification('REMOVED', deletedTask);
    }, 100);
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      message: 'Database error',
      error: error.sqlMessage || error.message
    });
  }
});

export default router;

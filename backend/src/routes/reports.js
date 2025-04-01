import express from 'express';
import db from '../services/db.js';

const validModules = ['tasks', 'movements', 'training'];
const tableMap = {
  tasks: 'aircraft_tasks',
  movements: 'aircraft_movements',
  training: 'training_flights'
};

const router = express.Router();

// Unified report endpoint
router.get('/', async (req, res) => {
  try {
    const { module, startDate, endDate } = req.query;

    // Validate input parameters
    if (!validModules.includes(module)) {
      return res.status(400).json({ message: 'Invalid module specified' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Both start and end dates are required' });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    const tableName = tableMap[module];

    // Use the correct table name from the module parameter
    let query;
    if (module === 'training') {
      query = `
        SELECT *,
        CASE
          WHEN ata IS NOT NULL AND atd IS NOT NULL
          THEN TIME_FORMAT(TIMEDIFF(CAST(ata AS TIME), CAST(atd AS TIME)), '%H:%i')
          ELSE NULL
        END AS total_flight_time
        FROM ${tableName}
        WHERE date_of_flight BETWEEN ? AND ?
        ORDER BY date_of_flight DESC
      `;
    } else {
      query = `
        SELECT *
        FROM ${tableName}
        WHERE date_of_flight BETWEEN ? AND ?
        ORDER BY date_of_flight DESC
      `;
    }

    const [results] = await db.query(query, [startDate, endDate]);

    res.status(200).json(results);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      message: 'Failed to generate report',
      error: error.message
    });
  }
});

export default router;
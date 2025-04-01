import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TaskTableHeader from './TaskTableHeader';
import TaskTableBody from './TaskTableBody';
import EditTaskModal from './EditTaskModal';
import AddTaskModal from './AddTaskModal';
import Pagination from './Pagination';
import { handleApiError } from '../../utils/errorHandler';
import SideMenu from '../SideMenu';

const TaskTable = () => {
  const [tasks, setTasks] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);
  const [error, setError] = useState('');
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [newTask, setNewTask] = useState({
    task_number: '',
    date_of_flight: '',
    aircraft_type: '',
    estimated_time_of_departure: '',
    route: '',
    purpose: '',
    crew: '',
    pax: '',
    occurrence_status: 'Pending',
    authority: '',
    task_status: 'provisional',
    affected_dates: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
        fetchTasks();
        // Get current user from localStorage or session
        const user = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'Guest';
        setCurrentUser(user);
      }, []);
       // Dynamic search effect
        useEffect(() => {
            if (searchTerm.trim() === '') {
              setIsSearchActive(false);
              // If no search term, revert to date filter
              filterTasksByDate(selectedDate, tasks);
            } else {
              setIsSearchActive(true);
              const results = searchTasks(searchTerm, tasks);
              setFilteredTasks(results);
            }
            setCurrentPage(1);
          }, [searchTerm, tasks]);

        /**
         * Normalize text for case-insensitive and special character-insensitive search
         * @param {string} text - Text to normalize
         * @returns {string} Normalized text
         */
        const normalizeText = (text) => {
          if (text === null || text === undefined) return '';
          return text.toString()
            .toLowerCase()
            .replace(/[-\s]/g, ''); // Remove hyphens and spaces
        };

        /**
         * Search tasks based on search term
         * @param {string} term - Search term
         * @param {Array} tasksArray - Array of tasks to search
         * @returns {Array} Filtered tasks
         */
        const searchTasks = (term, tasksArray) => {
          const normalizedTerm = normalizeText(term);

          return tasksArray.filter(task => {
            // Check each searchable field for a match
            return (
              normalizeText(task.task_number).includes(normalizedTerm) ||
              normalizeText(task.aircraft_type).includes(normalizedTerm) ||
              normalizeText(task.route).includes(normalizedTerm) ||
              normalizeText(task.purpose).includes(normalizedTerm) ||
              normalizeText(task.crew).includes(normalizedTerm) ||
              normalizeText(task.authority).includes(normalizedTerm) ||
              normalizeText(task.task_status).includes(normalizedTerm)
            );
          }).sort((a, b) => {
            // Sort by date of flight in descending order (newest first)
            return new Date(b.date_of_flight) - new Date(a.date_of_flight);
          });
        };

 const handleDelete = async (id) => {
   if (window.confirm('Are you sure you want to delete this task?')) {
     try {
       await axios.delete(`http://localhost:5000/api/tasks/${id}`);
       fetchTasks();
       setIsEditing(false);
       setSuccessMessage('Task deleted successfully');
       setTimeout(() => setSuccessMessage(''), 3000);
     } catch (error) {
       console.error('Delete Error:', error.response?.data);
       setError(error.response?.data?.error || 'Failed to delete task');
     }
   }
 };


 /**
  * Generate a task number based on prefix and ALWAYS using the current system date
  * @param {string} prefix - The prefix for the task number
  * @returns {string} Formatted task number
  */
 const generateTaskNumber = (prefix) => {
   // Always use current date for month/year, ignoring any dates passed in
   const currentDate = new Date();
   const month = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase();
   const year = currentDate.getFullYear().toString().slice(-2);
   return `${prefix}/${month}/${year}`;
 };

  /**
   * Fetch all tasks from the API
   */
   const fetchTasks = () => {
      axios.get('http://localhost:5000/api/tasks')
        .then(response => {
          setTasks(response.data);
          if (searchTerm.trim() !== '') {
            const results = searchTasks(searchTerm, response.data);
            setFilteredTasks(results);
          } else {
            filterTasksByDate(selectedDate, response.data);
          }
        })
        .catch(error => handleApiError(error, setError));
    };

  /**
   * Filter tasks by the selected date
   * @param {string} date - The date to filter by in YYYY-MM-DD format
   * @param {Array} tasksArray - The array of tasks to filter
   */
  const filterTasksByDate = (date, tasksArray) => {
    const filtered = tasksArray.filter(task => {
      const taskDate = task.date_of_flight.split('T')[0];
      return taskDate === date;
    });
    setFilteredTasks(filtered);
  };

  /**
   * Handle date change in the date picker
   * @param {Event} e - The event object
   */
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };

  /**
   * Apply date filter to tasks
   */
  const handleCheckTasks = () => {
    setSearchTerm(''); // Clear search term when checking by date
    setIsSearchActive(false);
    filterTasksByDate(selectedDate, tasks);
    setCurrentPage(1);
  };

 const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  /**
   * Handle editing a task
   * @param {Object} task - The task to edit
   */
  const handleEdit = (task) => {
    setCurrentTask({...task});
    setIsEditing(true);
  };

  /**
   * Handle input changes in the edit modal
   * @param {string} field - The field name
   * @param {any} value - The new value
   */
  const handleInputChange = (field, value) => {
    setCurrentTask(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`Field ${field} updated to:`, value);
      console.log('Updated task:', updated);
      return updated;
    });
  };

  /**
   * Save edited task
   * @param {Object} taskToSave - The task to save (optional)
   * @returns {Promise<boolean>} Success indicator
   */
  const handleSaveTask = async (taskToSave = null) => {
    try {
      // Use provided task object if available, otherwise use currentTask
      const taskData = taskToSave || currentTask;

      // Ensure task_status is included
      if (!taskData.task_status) {
        console.error('No task_status found in task data');
        setError('Task status is required');
        return false;
      }

      console.log('Sending task update to API:', taskData);

      const response = await axios.put(`http://localhost:5000/api/tasks/${taskData.id}`, taskData);
      console.log('API response:', response.data);

      // Update tasks list with the updated task
      setTasks(prev =>
        prev.map(task => task.id === response.data.task.id ? response.data.task : task)
      );

      // Update filtered tasks
      // Re-apply current filter (search or date)
            if (isSearchActive) {
              const results = searchTasks(searchTerm, tasks.map(task =>
                task.id === response.data.task.id ? response.data.task : task
              ));
              setFilteredTasks(results);
            } else {
              filterTasksByDate(selectedDate, tasks.map(task =>
                task.id === response.data.task.id ? response.data.task : task
              ));
            }

      setIsEditing(false);
      setSuccessMessage('Task updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      handleApiError(error, setError);
      return false;
    }
  };

 /**
   * Confirm or unconfirm a task
   * @param {Object} task - The task to confirm/unconfirm
   */
const handleConfirmTask = async (task) => {
  // If the task is already confirmed, alert the user and do nothing.
  if (task.task_status === 'confirmed') {
    window.alert("This task is already confirmed.");
    return;
  }

  if (window.confirm("Do you want to confirm this task?")) {
    try {
      // Call the backend endpoint to confirm the task.
      const response = await axios.post(`http://localhost:5000/api/tasks/${task.id}/confirm`);

      // Update all tasks with the same group_id (if it exists) or just the single task
      const updatedTasks = tasks.map(t =>
        (task.group_id && t.group_id === task.group_id) || t.id === task.id
          ? {
              ...t,
              task_status: 'confirmed',
              task_number: response.data.taskNumber || t.task_number,
            }
          : t
      );

      setTasks(updatedTasks);

      // Re-apply the current filter (either search or date-based).
      if (isSearchActive) {
        const results = searchTasks(searchTerm, updatedTasks);
        setFilteredTasks(results);
      } else {
        filterTasksByDate(selectedDate, updatedTasks);
      }

      setSuccessMessage("Task confirmed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      handleApiError(error, setError);
    }
  }
};


   const handleActivate = (task) => {
     // Prepare only the data we want to transfer to the movements page
     const movementData = {
     fromTaskTable: true,
       date_of_flight: task.date_of_flight,
       task_number: task.task_number,
       aircraft_type: task.aircraft_type,
       purpose: task.purpose,
       // You can include any other fields you want to transfer
        occurrence_status: 'In Progress',
         call_sign: '',
         dept_aerod: '',
         atd: '',
         enroute_estimates: '',
         dest_aerod: '',
         ata: '',
         remarks: ''
     };

     // Navigate to the Aircraft Movements Manager page, passing the selected data
     navigate('/aircraft-movements', { state: { movementData } });
   }

  /**
   * Add a new task
   * @param {Object} taskToAdd - The task to add
   */
const handleAddTask = async (taskToAdd) => {
  try {
    let affectedDates = [];

    // Process affected_dates from string to array
    if (taskToAdd.affected_dates) {
      affectedDates = taskToAdd.affected_dates
        .split(',')
        .map(date => date.trim())
        .filter(date => {
          // Basic validation for YYYY-MM-DD format
          return date && /^\d{4}-\d{2}-\d{2}$/.test(date);
        });
    }

    const processedTask = {
      ...taskToAdd,
      affected_dates: affectedDates
    };

    const response = await axios.post('http://localhost:5000/api/tasks', processedTask);
    // Assuming your backend returns an array of inserted tasks
    const updatedTasks = [...tasks, ...response.data];

    setTasks(updatedTasks);
    // Re-apply current filter (search or date)
    if (isSearchActive) {
      const results = searchTasks(searchTerm, updatedTasks);
      setFilteredTasks(results);
    } else {
      filterTasksByDate(selectedDate, updatedTasks);
    }

    setIsAdding(false);
    setCurrentPage(1);
    setSuccessMessage('Task Successfully Added!');
    setTimeout(() => setSuccessMessage(''), 3000);

    // Reset the form state
    setNewTask({
      task_number: '',
      date_of_flight: '',
      aircraft_type: '',
      estimated_time_of_departure: '',
      route: '',
      purpose: '',
      crew: '',
      pax: '',
      occurrence_status: 'Pending',
      authority: '',
      task_status: 'provisional',
      affected_dates: '',
    });
  } catch (error) {
    handleApiError(error, setError);
    setIsAdding(false);
  }
};
 //Handle navigation to different sections
    const navigateToSection = (section) => {
      navigate(`/${section}`);
      setShowSideMenu(false);
    };

  // Calculate pagination values
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  console.log("TaskTable rendering with:", {
    tasksPerPage,
    filteredTasksLength: filteredTasks.length,
    currentPage,
    shouldShowPagination: filteredTasks.length > tasksPerPage
  });

   return (
        <div className="container mx-auto px-4 py-4">
          <SideMenu />
          <div className="flex justify-between items-center mb-4">
            <div className="text-left text-sm text-gray-600">
              Logged in as <span className="font-bold">{currentUser}</span>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-center text-3xl font-bold text-gray-800">
              AIRCRAFT TASKS MANAGER
            </h3>
            <div className="border-b-2 border-gray-300 w-1/4 mx-auto mb-6"></div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>}
            {successMessage && (
              <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-slide-in z-50">
                {successMessage}
              </div>
            )}
                <TaskTableHeader
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  onCheckTasks={handleCheckTasks}
                  onAddTask={() => setIsAdding(true)}
                  onNavigateHome={() => navigate('/home')}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
                {/* Display search information when search is active */}
                        {isSearchActive && (
                          <div className="mb-4 text-gray-700">
                            <p>
                              Showing {filteredTasks.length} results for "{searchTerm}"
                              sorted by date (newest first)
                            </p>
                          </div>
                        )}

          <TaskTableBody
            filteredTasks={currentTasks}
            selectedDate={selectedDate}
            onEdit={handleEdit}
            onConfirm={handleConfirmTask}
            onActivate={handleActivate}
          />
          <Pagination
            tasksPerPage={tasksPerPage}
            totalTasks={filteredTasks.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
          {isEditing && (
            <EditTaskModal
              isEditing={isEditing}
              currentTask={currentTask}
              onSave={handleSaveTask}
              onCancel={() => setIsEditing(false)}
              onInputChange={handleInputChange}
              generateTaskNumber={generateTaskNumber}
              onDelete={handleDelete}
            />
          )}
          {isAdding && (
            <AddTaskModal
              isAdding={isAdding}
              newTask={newTask}
              onAdd={handleAddTask}
              onCancel={() => setIsAdding(false)}
              onInputChange={(key, value) => setNewTask({ ...newTask, [key]: value })}
              generateTaskNumberProp={generateTaskNumber}
            />
          )}
         </div>
        </div>
   );
};

export default TaskTable;
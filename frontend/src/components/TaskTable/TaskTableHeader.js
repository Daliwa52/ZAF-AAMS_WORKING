import React from 'react';

const TaskTableHeader = ({
  selectedDate,
  onDateChange,
  onCheckTasks,
  onAddTask,
  onNavigateHome,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={onDateChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={onCheckTasks}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Check Tasks
          </button>
        </div>

        <div className="relative w-1/3">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={onSearchChange}
                  className="w-full p-2 border border-gray-300 rounded pl-8"
                />
                <svg
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

        <div className="flex space-x-2 items-center">
          <button
            onClick={onAddTask}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            Add Task
          </button>
          <button
            onClick={onNavigateHome}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskTableHeader;
import React, { useState, useEffect } from 'react';

const EditTaskModal = ({
  isEditing,
  currentTask,
  onSave,
  onCancel,
  onInputChange,
  onDelete
}) => {
  useEffect(() => {
    if (currentTask?.affected_dates) {
      if (Array.isArray(currentTask.affected_dates)) {
        onInputChange('affected_dates', currentTask.affected_dates.join(', '));
      }
      else if (currentTask.affected_dates.startsWith('[')) {
        try {
          const parsed = JSON.parse(currentTask.affected_dates);
          onInputChange('affected_dates', parsed.join(', '));
        } catch (e) {
          // Leave as-is if parsing fails
        }
      }
    }
  }, [currentTask, onInputChange]);

  const handleDelete = async () => {
    try {
      await onDelete(currentTask.id);
      onCancel();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleAffectedDatesChange = (value) => {
    onInputChange('affected_dates', value);
  };

  const getAffectedDatesString = () => {
    if (currentTask.affected_dates) {
      if (typeof currentTask.affected_dates === 'string') {
        if (currentTask.affected_dates.trim().startsWith('[')) {
          try {
            const parsed = JSON.parse(currentTask.affected_dates);
            return parsed.join(', ');
          } catch (e) {
            return currentTask.affected_dates.replace(/[[\]]/g, '');
          }
        }
        return currentTask.affected_dates;
      }
      return currentTask.affected_dates.join(', ');
    }
    return '';
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();

    let taskToSave = { ...currentTask };

    // REMOVED: delete taskToSave.task_number
    // Now preserving the task number as edited

    // Properly handle affected dates
    if (!taskToSave.affected_dates || taskToSave.affected_dates.trim() === '') {
      taskToSave.affected_dates = JSON.stringify([]);
    }
    else if (typeof taskToSave.affected_dates === 'string' && !taskToSave.affected_dates.startsWith('[')) {
      const dates = taskToSave.affected_dates.split(',')
        .map(date => date.trim())
        .filter(date => date !== '');
      taskToSave.affected_dates = JSON.stringify(dates);
    }

    await onSave(taskToSave);
    onCancel();
  };

  const isValidDateInput = (dateInput) => {
    if (!dateInput) return true;

    try {
      const dates = typeof dateInput === 'string'
        ? dateInput.split(',').map(d => d.trim()).filter(d => d)
        : Array.isArray(dateInput)
          ? dateInput
          : [dateInput];

      return dates.every(date => {
        if (!date) return true;
        return /^\d{4}-\d{2}-\d{2}$/.test(date.trim());
      });
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>

        <form onSubmit={handleSaveClick}>
          <div className="space-y-4">
            {/* Task Number - Now Fully Editable */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Task Number:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentTask.task_number || ''}
                  onChange={(e) => onInputChange('task_number', e.target.value)}
                  placeholder="Enter task number"
                />
              </label>
              <label className="block">
                Date of Flight:
                <input
                  type="date"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentTask.date_of_flight?.split('T')[0] || ''}
                  onChange={(e) => onInputChange('date_of_flight', e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Existing form fields remain the same */}
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                Affected Dates:
                <textarea
                  className={`border p-2 w-full rounded mt-1 ${
                    !isValidDateInput(currentTask.affected_dates) ?
                    'border-red-500' : 'border-gray-300'
                  }`}
                  value={getAffectedDatesString()}
                  onChange={(e) => handleAffectedDatesChange(e.target.value)}
                  placeholder="Enter comma-separated dates (YYYY-MM-DD)"
                />
              </label>
            </div>

            {/* Rest of the form remains the same as in the previous version */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Aircraft Type:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentTask.aircraft_type || ''}
                  onChange={(e) => onInputChange('aircraft_type', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                ETD:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentTask.estimated_time_of_departure || ''}
                  onChange={(e) => onInputChange('estimated_time_of_departure', e.target.value)}
                  placeholder="HH:MM or TBN/A/R"
                  required
                />
              </label>
            </div>

            {/* Remaining form sections... */}
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                Route:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentTask.route || ''}
                  onChange={(e) => onInputChange('route', e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                Purpose:
                <textarea
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentTask.purpose || ''}
                  onChange={(e) => onInputChange('purpose', e.target.value)}
                  rows="3"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                Crew:
                <textarea
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentTask.crew || ''}
                  onChange={(e) => onInputChange('crew', e.target.value)}
                  rows="3"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                PAX:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentTask.pax || ''}
                  onChange={(e) => onInputChange('pax', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                Occurrence Status:
                <select
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentTask.occurrence_status || 'Pending'}
                  onChange={(e) => onInputChange('occurrence_status', e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Undertaken">Undertaken</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Authority:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentTask.authority || ''}
                  onChange={(e) => onInputChange('authority', e.target.value)}
                />
              </label>
              <label className="block">
                Task Status:
                <select
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentTask.task_status || ''}
                  onChange={(e) => onInputChange('task_status', e.target.value)}
                >
                  <option value="provisional">Provisional</option>
                  <option value="military">Military</option>
                  <option value="civil">Civil</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Save Changes
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
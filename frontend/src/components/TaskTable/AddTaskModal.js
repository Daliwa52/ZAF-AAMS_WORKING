import React, { useState } from 'react';

const AddTaskModal = ({
  isAdding,
  newTask,
  onAdd,
  onCancel,
  onInputChange,
  generateTaskNumberProp,
}) => {
  // Use a local state for date so that auto-scroll and UI feel smoother
  const [localDate, setLocalDate] = useState(newTask.date_of_flight);

  if (!isAdding) return null;

  const handleStatusChange = (status) => {
    const prefixMap = {
      provisional: 'PROV',
      military: 'MIL',
      civil: 'CIV',
      confirmed: '',
    };

    let taskNumber = newTask.task_number;

    if (status === 'confirmed') {
      // Ask for user confirmation
      if (!window.confirm('Confirm will generate permanent number. Continue?')) {
        return; // If user clicks "Cancel," do nothing
      }
      // For confirmed status, we'll let the backend assign the number
      // Just update the status but keep the task number as is
      onInputChange('task_status', status);
    } else if (newTask.date_of_flight) {
      // If we have a date, generate a new prefix-based number
      taskNumber = generateTaskNumberProp(prefixMap[status], newTask.date_of_flight);

      // Update both status and number
      onInputChange('task_status', status);
      onInputChange('task_number', taskNumber);
    } else {
      // If no date yet, just update the status
      onInputChange('task_status', status);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setLocalDate(newDate);

    // If status is not confirmed, update the task number based on the new date
    if (newTask.task_status !== 'confirmed' && newDate) {
      const prefixMap = {
        provisional: 'PROV',
        military: 'MIL',
        civil: 'CIV',
      };
      // If no status is chosen yet, default to provisional
      const effectiveStatus = newTask.task_status || 'provisional';
      const newTaskNumber = generateTaskNumberProp(prefixMap[effectiveStatus], newDate);

      onInputChange('date_of_flight', newDate);
      onInputChange('task_number', newTaskNumber);
    } else {
      // Just update the date
      onInputChange('date_of_flight', newDate);
    }
  };

  // Form submit: calls parent onAdd with the updatedTask
  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedTask = {
      ...newTask,
      date_of_flight: localDate,
    };
    onAdd(updatedTask);
  };

  // onFocus handler to scroll the focused element into view
  const scrollIntoViewOnFocus = (e) =>
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Add New Task</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Row 1: Task Number & Date of Flight */}
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Task Number:
                  <input
                    type="text"
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newTask.task_number}
                    onChange={(e) => onInputChange('task_number', e.target.value)}
                    placeholder="XXX/MMM/YY"
                  />
                </label>
                <label className="block">
                  Date of Flight:
                  <input
                    type="date"
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={localDate}
                    onChange={handleDateChange}
                    required
                  />
                </label>
              </div>

              {/* Row 2: Affected Dates */}
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  Affected Dates:
                  <textarea
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newTask.affected_dates}
                    onChange={(e) => onInputChange('affected_dates', e.target.value)}
                    placeholder="Date format YYYY-MM-DD separated by comma"
                  />
                </label>
              </div>

              {/* Row 3: Aircraft Type & ETD */}
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Aircraft Type:
                  <input
                    type="text"
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newTask.aircraft_type}
                    onChange={(e) => onInputChange('aircraft_type', e.target.value)}
                    placeholder="C-27J or B-412 etc"
                    required
                  />
                </label>
                <label className="block">
                  ETD:
                  <input
                    type="text"
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newTask.estimated_time_of_departure}
                    onChange={(e) => onInputChange('estimated_time_of_departure', e.target.value)}
                    placeholder="HH:MM or TBN or A/R"
                    required
                  />
                </label>
              </div>

              {/* Row 4: Route */}
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  Route:
                  <textarea
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newTask.route}
                    onChange={(e) => onInputChange('route', e.target.value)}
                    placeholder="Lusaka - Mbala - Lusaka"
                    rows="2"
                    required
                  />
                </label>
              </div>

              {/* Row 5: Purpose */}
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  Purpose:
                  <textarea
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newTask.purpose}
                    onChange={(e) => onInputChange('purpose', e.target.value)}
                    placeholder="Convey......"
                    rows="2"
                    required
                  />
                </label>
              </div>

              {/* Row 6: Crew */}
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  Crew:
                  <input
                    type="text"
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newTask.crew}
                    onChange={(e) => onInputChange('crew', e.target.value)}
                    placeholder="Pilot in Command & Co-Pilot"
                    required
                  />
                </label>
              </div>

              {/* Row 7: PAX & Occurrence Status */}
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  PAX:
                  <input
                    type="text"
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newTask.pax}
                    onChange={(e) => onInputChange('pax', e.target.value)}
                    placeholder="e.g, 10 (VIP)"
                    required
                  />
                </label>
                <label className="block">
                  Occurrence Status:
                  <select
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newTask.occurrence_status}
                    onChange={(e) => onInputChange('occurrence_status', e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Undertaken">Undertaken</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </label>
              </div>

              {/* Row 8: Authority & Task Status */}
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Authority:
                  <input
                    type="text"
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newTask.authority}
                    onChange={(e) => onInputChange('authority', e.target.value)}
                    placeholder="SOO or D/SOO"
                  />
                </label>
                <label className="block">
                  Task Status:
                  <select
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newTask.task_status}
                    onChange={(e) => handleStatusChange(e.target.value)}
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
                  Add Task
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

export default AddTaskModal;
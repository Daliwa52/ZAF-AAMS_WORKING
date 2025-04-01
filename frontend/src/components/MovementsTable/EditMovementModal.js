import React from 'react';

const EditMovementModal = ({
  isEditing,
  currentMovement,
  onSave,
  onCancel,
  onInputChange,
  onDelete,
}) => {
  if (!isEditing || !currentMovement) return null;

  const handleSaveClick = async (e) => {
    e.preventDefault();
    await onSave(currentMovement);
    onCancel();
  };

  const handleDeleteClick = async () => {
    try {
      await onDelete(currentMovement.id);
      onCancel(); // Close the modal after successful deletion
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete the movement. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Movement</h2>
        <form onSubmit={handleSaveClick}>
          <div className="space-y-4">
            {/* Row 1: Date of Flight & Task Number */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Date of Flight:
                <input
                  type="date"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentMovement.date_of_flight?.split('T')[0] || ''}
                  onChange={(e) => onInputChange('date_of_flight', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                Task Number:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentMovement.task_number || ''}
                  onChange={(e) => onInputChange('task_number', e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Row 2: Call Sign & Aircraft Type */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Call Sign:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentMovement.call_sign || ''}
                  onChange={(e) => onInputChange('call_sign', e.target.value)}
                />
              </label>
              <label className="block">
                Aircraft Type:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentMovement.aircraft_type || ''}
                  onChange={(e) => onInputChange('aircraft_type', e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Row 3: Departure Aerodrome & ATD */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Departure Aerodrome:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentMovement.dept_aerod || ''}
                  onChange={(e) => onInputChange('dept_aerod', e.target.value)}
                />
              </label>
              <label className="block">
                ATD (HH:MM):
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="HH:MM"
                  value={currentMovement.atd || ''}
                  onChange={(e) => onInputChange('atd', e.target.value)}
                />
              </label>
            </div>

            {/* Row 4: Enroute Estimates (full width) */}
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                Enroute Estimates:
                <textarea
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentMovement.enroute_estimates || ''}
                  onChange={(e) => onInputChange('enroute_estimates', e.target.value)}
                  rows="3"
                />
              </label>
            </div>

            {/* Row 5: Destination Aerodrome & ATA */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Destination Aerodrome:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentMovement.dest_aerod || ''}
                  onChange={(e) => onInputChange('dest_aerod', e.target.value)}
                />
              </label>
              <label className="block">
                ATA (HH:MM):
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="HH:MM"
                  value={currentMovement.ata || ''}
                  onChange={(e) => onInputChange('ata', e.target.value)}
                />
              </label>
            </div>

            {/* Row 6: Purpose (full width) */}
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                Purpose:
                <textarea
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentMovement.purpose || ''}
                  onChange={(e) => onInputChange('purpose', e.target.value)}
                  rows="3"
                  required
                />
              </label>
            </div>

            {/* Row 7: Occurrence Status & Remarks */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Occurrence Status:
                <select
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentMovement.occurrence_status || 'In Progress'}
                  onChange={(e) => onInputChange('occurrence_status', e.target.value)}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Tech Stop">Tech Stop</option>
                  <option value="Task Complete">Task Complete</option>
                </select>
              </label>
              <label className="block">
                Remarks:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={currentMovement.remarks || ''}
                  onChange={(e) => onInputChange('remarks', e.target.value)}
                />
              </label>
            </div>

            {/* Save/Cancel/Delete Buttons */}
            <div className="flex gap-4 mt-6 justify-between">
              <div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 ml-2"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => onDelete(currentMovement.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovementModal;
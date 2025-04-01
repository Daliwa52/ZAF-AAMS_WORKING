import React, { useState, useEffect } from 'react';

const AddMovementModal = ({
  isAdding,
  onAdd,
  onCancel,
  initialData
}) => {
  // Default empty movement data
   const [newMovement, setNewMovement] = useState({
    date_of_flight: new Date().toISOString().split('T')[0],
    task_number: '',
    call_sign: '',
    aircraft_type: '',
    dept_aerod: '',
    atd: '',
    enroute_estimates: '',
    dest_aerod: '',
    purpose: '',
    ata: '',
    occurrence_status: 'In Progress',
    remarks: ''
  });
useEffect(() => {
    if (initialData) {
      // Merge initial data with defaults
      setNewMovement(prev => ({
        ...prev,
        ...initialData,
        date_of_flight: initialData.date_of_flight || new Date().toISOString().split('T')[0]
      }));
    } else if (isAdding) {
      // Reset to defaults when opening normally
      setNewMovement(prev => ({
        ...prev,
        date_of_flight: new Date().toISOString().split('T')[0],
        task_number: '',
        call_sign: '',
        aircraft_type: '',
        dept_aerod: '',
        atd: '',
        enroute_estimates: '',
        dest_aerod: '',
        purpose: '',
        ata: '',
        remarks: ''
      }));
    }
  }, [isAdding, initialData]);

  const handleChange = (field, value) => {
     setNewMovement(prev => ({ ...prev, [field]: value }));
   };

   const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(newMovement);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Movement</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Row 1: Date of Flight & Task Number */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Date of Flight:
                 <input
                    type="date"
                    className="border border-gray-300 p-2 w-full rounded mt-1"
                    value={newMovement.date_of_flight}
                    onChange={(e) => handleChange('date_of_flight', e.target.value)}
                    required
                  />
              </label>
              <label className="block">
                Task Number:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="XXX/MMM/YY"
                  value={newMovement.task_number}
                  onChange={(e) => handleChange('task_number', e.target.value)}
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
                  placeholder="e.g. EAGLE 37"
                  value={newMovement.call_sign}
                  onChange={(e) => handleChange('call_sign', e.target.value)}
                />
              </label>
              <label className="block">
                Aircraft Type:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="e.g. C-27J or Y-12"
                  value={newMovement.aircraft_type}
                  onChange={(e) => handleChange('aircraft_type', e.target.value)}
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
                  placeholder="Point of Departure"
                  value={newMovement.dept_aerod}
                  onChange={(e) => handleChange('dept_aerod', e.target.value)}
                />
              </label>
              <label className="block">
                ATD (HH:MM):
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="HH:MM"
                  value={newMovement.atd}
                  onChange={(e) => handleChange('atd', e.target.value)}
                />
              </label>
            </div>

            {/* Row 4: Enroute Estimates (full width) */}
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                Enroute Estimates:
                <textarea
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="e.g. ETA FLHN --:--"
                  value={newMovement.enroute_estimates}
                  onChange={(e) => handleChange('enroute_estimates', e.target.value)}
                  rows="3"
                />
              </label>
            </div>

            {/* Row 6: Purpose (full width) */}
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                Purpose:
                <textarea
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="e.g. CONVEY THE AIR FORCE CDR PLUS PARTY"
                  value={newMovement.purpose}
                  onChange={(e) => handleChange('purpose', e.target.value)}
                  rows="3"
                  required
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
                  placeholder="Final Destination"
                  value={newMovement.dest_aerod}
                  onChange={(e) => handleChange('dest_aerod', e.target.value)}
                />
              </label>
              <label className="block">
                ATA (HH:MM):
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="HH:MM"
                  value={newMovement.ata}
                  onChange={(e) => handleChange('ata', e.target.value)}
                />
              </label>
            </div>

            {/* Row 7: Occurrence Status & Remarks */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Occurrence Status:
                <select
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={newMovement.occurrence_status}
                  onChange={(e) => handleChange('occurrence_status', e.target.value)}
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
                  placeholder="Current Position"
                  value={newMovement.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                />
              </label>
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Movement
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

export default AddMovementModal;
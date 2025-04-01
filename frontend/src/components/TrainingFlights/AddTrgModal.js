import React, { useState, useEffect } from 'react';

const AddTrgModal = ({
  isAdding,
  onAdd,
  onCancel,
  initialData
}) => {
  // Default training flight data
  const [newTraining, setNewTraining] = useState({
       date_of_flight: new Date().toLocaleDateString('en-CA'), // Use local date format
      call_sign: '',
      aircraft_type: '',
      atd: '',
      route: '',
      ata: '',
      duty: '',
      crew: ''
    });

  const [timeErrors, setTimeErrors] = useState({ atd: false, ata: false });

  useEffect(() => {
    if (initialData) {
      setNewTraining(prev => ({
        ...prev,
        ...initialData,
        date_of_flight: initialData.date_of_flight?.split('T')[0] || new Date().toLocaleDateString('en-CA')
      }));
    } else if (isAdding) {
      setNewTraining({
        date_of_flight: new Date().toLocaleDateString('en-CA'),
        call_sign: '',
        aircraft_type: '',
        atd: '',
        route: '',
        ata: '',
        duty: '',
        crew: ''
      });
    }
  }, [isAdding, initialData]);

   const validateTime = (time) => {
     if (!time) return true; // Empty is valid
     return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
   };

    const handleSubmit = (e) => {
      e.preventDefault();

      // Validate times only if they are not empty
      const atdValid = validateTime(newTraining.atd);
      const ataValid = validateTime(newTraining.ata);

      setTimeErrors({
        atd: !atdValid && newTraining.atd !== '',
        ata: !ataValid && newTraining.ata !== ''
      });

      if ((newTraining.atd && !atdValid) || (newTraining.ata && !ataValid)) {
        alert('Please enter valid times in HH:MM format (24-hour)');
        return;
      }

      // Format data for backend - properly handle padding for single digit hours
      const formattedData = {
          ...newTraining,
          atd: newTraining.atd || null, // Send null instead of empty string
          ata: newTraining.ata || null
        };

        onAdd(formattedData);
      };

  const handleChange = (field, value) => {
    if (field === 'atd' || field === 'ata') {
      // Preserve only digits and colons
      let cleanedValue = value.replace(/[^0-9:]/g, '');

      // Handle auto-formatting for user convenience
      if (cleanedValue.length === 2 && !cleanedValue.includes(':')) {
        cleanedValue += ':';
      }

      // Ensure we don't exceed HH:MM format length
      cleanedValue = cleanedValue.substring(0, 5);

      // For hours above 23, cap at 23
      if (cleanedValue.length >= 2) {
        const hours = parseInt(cleanedValue.split(':')[0]);
        if (hours > 23) {
          cleanedValue = '23' + cleanedValue.substring(2);
        }
      }

      setNewTraining(prev => ({ ...prev, [field]: cleanedValue }));
    } else {
      setNewTraining(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Training Flight</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Date and Call Sign */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Date of Flight:
                <input
                  type="date"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={newTraining.date_of_flight}
                  onChange={(e) => handleChange('date_of_flight', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                Call Sign:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="e.g. FALCON 44"
                  value={newTraining.call_sign}
                  onChange={(e) => handleChange('call_sign', e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Aircraft Type and ATD */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Aircraft Type:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="e.g. SF-260"
                  value={newTraining.aircraft_type}
                  onChange={(e) => handleChange('aircraft_type', e.target.value)}
                />
              </label>
              <label className="block">
                ATD (HH:MM):
                <input
                  type="text"
                  className={`border p-2 w-full rounded mt-1 ${
                    timeErrors.atd ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="HH:MM"
                  value={newTraining.atd}
                  onChange={(e) => handleChange('atd', e.target.value)}
                />
                {timeErrors.atd && (
                  <p className="text-red-500 text-sm mt-1">Invalid time format</p>
                )}
              </label>
            </div>

            {/* Route */}
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                Route:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="e.g. FLHN - SW2 - FLHN"
                  value={newTraining.route}
                  onChange={(e) => handleChange('route', e.target.value)}
                />
              </label>
            </div>

            {/* ATA and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                ATA (HH:MM):
                <input
                  type="text"
                  className={`border p-2 w-full rounded mt-1 ${
                    timeErrors.ata ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="HH:MM"
                  value={newTraining.ata}
                  onChange={(e) => handleChange('ata', e.target.value)}
                />
                {timeErrors.ata && (
                  <p className="text-red-500 text-sm mt-1">Invalid time format</p>
                )}
              </label>
              <label className="block">
                Total Flight Time:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1 bg-gray-100"
                  value={newTraining.total_flight_time || 'Auto Gen'}
                  readOnly
                />
              </label>
            </div>

            {/* Duty and Crew */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Duty:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="e.g. MIX 6 GH"
                  value={newTraining.duty}
                  onChange={(e) => handleChange('duty', e.target.value)}
                />
              </label>
              <label className="block">
                Crew:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="e.g. LT COL BESA & 2LT SEBA"
                  value={newTraining.crew}
                  onChange={(e) => handleChange('crew', e.target.value)}
                />
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Training Flight
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

export default AddTrgModal;
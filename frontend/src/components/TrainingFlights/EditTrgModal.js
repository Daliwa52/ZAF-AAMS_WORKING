import React, { useState, useEffect } from 'react';

const EditTrgModal = ({ isEditing, currentFlight, onSave, onCancel, onDelete }) => {
  const [editedFlight, setEditedFlight] = useState({
    date_of_flight: '',
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
    if (currentFlight) {
      setEditedFlight({
        ...currentFlight,
        date_of_flight: currentFlight.date_of_flight?.split('T')[0] || '',
        atd: currentFlight.atd?.substring(0, 5) || '',
        ata: currentFlight.ata?.substring(0, 5) || ''
      });
    }
  }, [currentFlight]);

  const validateTime = (time) => {
    if (!time) return true;
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  const handleChange = (field, value) => {
    if (['atd', 'ata'].includes(field)) {
      let cleaned = value.replace(/[^0-9:]/g, '');

      if (cleaned.length > 2 && !cleaned.includes(':')) {
        cleaned = `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
      }

      cleaned = cleaned.substring(0, 5);

      if (cleaned.includes(':')) {
        const [hoursStr] = cleaned.split(':');
        const hours = parseInt(hoursStr, 10) || 0;
        if (hours > 23) cleaned = `23:${cleaned.split(':')[1] || '00'}`;
      }

      setEditedFlight(prev => ({ ...prev, [field]: cleaned }));
    } else {
      setEditedFlight(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const atdValid = validateTime(editedFlight.atd);
    const ataValid = validateTime(editedFlight.ata);

    setTimeErrors({
      atd: !atdValid && editedFlight.atd !== '',
      ata: !ataValid && editedFlight.ata !== ''
    });

    if ((!atdValid && editedFlight.atd) || (!ataValid && editedFlight.ata)) {
      alert('Invalid time format. Use HH:MM (24-hour)');
      return;
    }

    // IMPORTANT CHANGE: Don't format times here, send as-is to backend
    // Let the backend handle the formatting consistently
    await onSave({
      ...editedFlight,
      // Ensure time fields are empty strings if undefined/null
      atd: editedFlight.atd || '',
      ata: editedFlight.ata || ''
    });
  };

  if (!isEditing || !currentFlight) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Training Flight</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Date and Call Sign */}
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                Date of Flight:
                <input
                  type="date"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  value={editedFlight.date_of_flight}
                  onChange={(e) => handleChange('date_of_flight', e.target.value)}
                />
              </label>
              <label className="block">
                Call Sign:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="FALCON 44"
                  value={editedFlight.call_sign}
                  onChange={(e) => handleChange('call_sign', e.target.value)}
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
                  placeholder="SF-260"
                  value={editedFlight.aircraft_type}
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
                  value={editedFlight.atd}
                  onChange={(e) => handleChange('atd', e.target.value)}
                />
                {timeErrors.atd && (
                  <p className="text-red-500 text-sm mt-1">Invalid format</p>
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
                  placeholder="e.g. FLKK - SW1 - FLKK"
                  value={editedFlight.route}
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
                  value={editedFlight.ata}
                  onChange={(e) => handleChange('ata', e.target.value)}
                />
                {timeErrors.ata && (
                  <p className="text-red-500 text-sm mt-1">Invalid format</p>
                )}
              </label>
              <label className="block">
                Total Flight Time:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1 bg-gray-100"
                  value={editedFlight.total_flight_time || 'TBN'}
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
                  placeholder="e.g. Training, Air Test"
                  value={editedFlight.duty}
                  onChange={(e) => handleChange('duty', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                Crew:
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full rounded mt-1"
                  placeholder="Names of crew members"
                  value={editedFlight.crew}
                  onChange={(e) => handleChange('crew', e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Buttons */}
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
                onClick={(e) => {
                  e.preventDefault(); // Prevent default to make sure form doesn't submit
                  onDelete(editedFlight.id);
                }}
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

export default EditTrgModal;
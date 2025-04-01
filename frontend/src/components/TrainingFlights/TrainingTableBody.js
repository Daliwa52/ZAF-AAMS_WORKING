import React from 'react';
import TrainingRow from './TrainingRow';

const TrainingTableBody = ({ flights, onEdit }) => {
  // Column width styles matching MovementTableBody
  const columnStyles = {
    date: { width: '90px', minWidth: '90px' },
    callSign: { width: '90px', minWidth: '110px' },
    acType: { width: '70px', minWidth: '70px' },
    atd: { width: '70px', maxWidth: '70px' },
    route: { width: '180px', maxWidth: '180px' },
    duty: { width: '120px', maxWidth: '120px' },
    ata: { width: '70px', maxWidth: '70px' },
    crew: { width: '180px', maxWidth: '180px' },
    duration: { width: '80px', maxWidth: '80px' },
    actions: { width: '70px', minWidth: '70px' }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="w-full overflow-x-auto mt-4">
      <table className="min-w-full table-auto border border-gray-200 table-fixed">
        <thead>
          <tr className="bg-gray-100">
            <th style={columnStyles.date} className="py-2 px-2 border">DATE</th>
            <th style={columnStyles.callSign} className="py-2 px-2 border">CALL SIGN</th>
            <th style={columnStyles.acType} className="py-2 px-2 border">A/C TYPE</th>
            <th style={columnStyles.atd} className="py-2 px-2 border">ATD</th>
            <th style={columnStyles.route} className="py-2 px-2 border">ROUTE</th>
            <th style={columnStyles.duty} className="py-2 px-2 border">DUTY</th>
            <th style={columnStyles.crew} className="py-2 px-2 border">CREW</th>
            <th style={columnStyles.ata} className="py-2 px-2 border">ATA</th>
            <th style={columnStyles.duration} className="py-2 px-2 border">DURATION</th>
            <th style={columnStyles.actions} className="py-2 px-2 border">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {flights.length === 0 ? (
            <tr>
              <td colSpan="10" className="py-4 px-2 border text-center text-gray-500">
                No training flights found
              </td>
            </tr>
          ) : (
            flights.map(flight => (
              <TrainingRow
                key={flight.id}
                flight={flight}
                onEdit={onEdit}
                formatDate={formatDate}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TrainingTableBody;
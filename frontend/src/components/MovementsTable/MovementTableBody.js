// src/components/MovementTableBody.js
import React from 'react';
import MovementsRow from './MovementsRow';

const MovementTableBody = ({ filteredMovements, onEdit }) => {
  // Column width styles matching TaskTable
  const columnStyles = {
    dof: { width: '90px', minWidth: '90px' },
    taskNo: { width: '110px', minWidth: '110px' },
    callSign: { width: '110px', minWidth: '110px' },
    acType: { width: '60px', maxWidth: '60px' },
    deptAerod: { width: '60px', maxWidth: '60px' },
    atd: { width: '60px', maxWidth: '60px' },
    enroute: { width: '160px', maxWidth: '160px' },
    destAerod: { width: '60px', maxWidth: '60px' },
    purpose: { width: '150px', maxWidth: '150px' },
    occurrence: { width: '100px', minWidth: '100px' },
    ata: { width: '60px', maxWidth: '60px' },
    remarks: { width: '90px', minWidth: '90px' },
    actions: { width: '80px', minWidth: '80px' }
  };

  return (
    <div className="w-full overflow-x-auto mt-4">
      <table className="min-w-full table-auto border border-gray-200 table-fixed">
        <thead>
          <tr className="bg-gray-100">
            <th style={columnStyles.dof} className="py-2 px-2 border">DATE OF FLIGHT</th>
            <th style={columnStyles.taskNo} className="py-2 px-2 border">TASK NO.</th>
            <th style={columnStyles.callSign} className="py-2 px-2 border">CALL SIGN</th>
            <th style={columnStyles.acType} className="py-2 px-2 border">A/C TYPE</th>
            <th style={columnStyles.deptAerod} className="py-2 px-2 border">DEPT AEROD</th>
            <th style={columnStyles.atd} className="py-2 px-2 border">ATD</th>
            <th style={columnStyles.enroute} className="py-2 px-2 border">ENROUTE ESTIMATES</th>
            <th style={columnStyles.destAerod} className="py-2 px-2 border">DEST AEROD</th>
            <th style={columnStyles.purpose} className="py-2 px-2 border">PURPOSE</th>
            <th style={columnStyles.ata} className="py-2 px-2 border">ATA</th>
            <th style={columnStyles.occurrence} className="py-2 px-2 border">POSITION</th>
            <th style={columnStyles.remarks} className="py-2 px-2 border">REMARKS</th>
            <th style={columnStyles.actions} className="py-2 px-2 border">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filteredMovements.length === 0 ? (
            <tr>
              <td colSpan="13" className="py-4 px-2 border text-center text-gray-500">
                No movements found for the selected date.
              </td>
            </tr>
          ) : (
            filteredMovements.map((movement) => (
              <MovementsRow key={movement.id} movement={movement} onEdit={onEdit} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MovementTableBody;
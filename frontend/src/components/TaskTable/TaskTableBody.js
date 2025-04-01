import React from 'react';
import TaskRow from './TaskRow';
import { useNavigate } from 'react-router-dom';

const TaskTableBody = ({ filteredTasks, onEdit, onConfirm, onActivate }) => {
  const navigate = useNavigate();

  const shouldShowConfirmButton = (taskStatus) => {
    return taskStatus === 'provisional' || taskStatus === 'military';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Column width styles
  const columnStyles = {
    taskNo: { width: '110px', minWidth: '110px' },
    status: { width: '90px', minWidth: '90px' },
    dof: { width: '90px', minWidth: '90px' },
    acType: { width: '60px', maxWidth: '60px' },
    etd: { width: '60px', maxWidth: '60px' },
    route: { width: '150px', maxWidth: '150px' },
    purpose: { width: '150px', maxWidth: '150px' },
    crew: { width: '150px', maxWidth: '150px' },
    pax: { width: '50px', maxWidth: '50px' },
    occurrence: { width: '100px', minWidth: '100px' },
    authority: { width: '100px', minWidth: '100px' },
    actions: { width: '80px', minWidth: '80px' }
  };

  return (
    <div className="w-full overflow-x-auto mt-4">
      <table className="min-w-full table-auto border border-gray-200 table-fixed">
        <thead>
          <tr className="bg-gray-100">
            <th style={columnStyles.taskNo} className="py-2 px-2 border">TASK NO.</th>
            <th style={columnStyles.status} className="py-2 px-2 border">STATUS</th>
            <th style={columnStyles.dof} className="py-2 px-2 border">D.O.F</th>
            <th style={columnStyles.acType} className="py-2 px-2 border">A/C TYPE</th>
            <th style={columnStyles.etd} className="py-2 px-2 border">ETD</th>
            <th style={columnStyles.route} className="py-2 px-2 border">ROUTE</th>
            <th style={columnStyles.purpose} className="py-2 px-2 border">PURPOSE</th>
            <th style={columnStyles.crew} className="py-2 px-2 border">CREW</th>
            <th style={columnStyles.pax} className="py-2 px-2 border">PAX</th>
            <th style={columnStyles.occurrence} className="py-2 px-2 border">OCCURRENCE</th>
            <th style={columnStyles.authority} className="py-2 px-2 border">AUTHORITY</th>
            <th style={columnStyles.actions} className="py-2 px-2 border">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.length === 0 ? (
            <tr>
              <td colSpan="12" className="py-4 px-2 border text-center text-gray-500">
                No tasks found for the selected date
              </td>
            </tr>
          ) : (
            filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onEdit={onEdit}
                onConfirm={onConfirm}
                onActivate={onActivate}
                columnStyles={columnStyles}
                formatDate={formatDate}
                shouldShowConfirmButton={shouldShowConfirmButton}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTableBody;
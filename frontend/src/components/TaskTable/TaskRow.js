import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
};

const displayStatus = (status) => {
  switch (status) {
    case 'provisional':
      return 'Provisional';
    case 'military':
      return 'Military';
    case 'civil':
      return 'Civil';
    case 'confirmed':
      return 'Confirmed';
    default:
      return status; // fallback
  }
};

const TaskRow = ({
  task,
  onEdit,
  onConfirm,
  onActivate,
  columnStyles,
  formatDate,
  shouldShowConfirmButton
}) => {
  const navigate = useNavigate();

 const getOccurrenceStatusStyle = (status) => {
   switch (status.toLowerCase()) {
     case 'pending':
       return 'bg-orange-100 text-orange-800 rounded-full px-3 py-1';
     case 'undertaken':
       return 'bg-green-100 text-green-800 rounded-full px-3 py-1';
     case 'cancelled':
       return 'bg-red-100 text-red-800 rounded-full px-3 py-1';
     default:
       return '';
   }
 };

  return (
    <tr className="hover:bg-gray-50">
      <td className="border px-2 py-1 font-mono min-w-[120px] text-center">{task.task_number}</td>
      <td className="border px-2 py-1 min-w-[100px] text-center">
        <span className={`font-medium ${
          task.task_status === 'confirmed' ? 'text-green-600' :
          task.task_status === 'provisional' ? 'text-blue-600' :
          task.task_status === 'military' ? 'text-purple-600' :
          task.task_status === 'civil' ? 'text-orange-600' : ''
        }`}>
          {displayStatus(task.task_status)}
        </span>
      </td>
      <td className="border px-2 py-1 w-[100px] text-center">{formatDate(task.date_of_flight)}</td>
      <td className="border px-2 py-1 w-[50px] text-center break-words whitespace-normal">{task.aircraft_type}</td>
      <td className="border px-2 py-1 w-[100px] text-center break-words whitespace-normal">{task.estimated_time_of_departure}</td>
      <td className="border px-2 py-1 w-[180px] whitespace-wrap">{task.route}</td>
      <td className="border px-2 py-1 w-[180px]">{task.purpose}</td>
      <td className="border px-2 py-1 w-[180px] text-left">{task.crew}</td>
      <td className="border px-2 py-1 w-[40px] text-center">{task.pax}</td>
      <td className="border px-2 py-1 w-[110px] text-center">
       <span className={`inline-block ${getOccurrenceStatusStyle(task.occurrence_status)}`}>
         {task.occurrence_status}
       </span>
     </td>
      <td className="border px-2 py-1 w-[70px] text-center">{task.authority}</td>
      <td style={columnStyles.actions} className="py-2 px-2 border text-center">
        <div className="flex flex-col space-y-1 items-center">
          <button
            onClick={() => onEdit(task)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs w-full"
          >
            Edit
          </button>
          {(task.task_status === 'provisional' || task.task_status === 'military') && (
            <button
              onClick={() => onConfirm(task)}
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-xs w-full"
            >
              Confirm
            </button>
          )}
          <button
            onClick={() => {
              navigate('/aircraft-movements', {
                state: {
                  movementData: {
                    date_of_flight: task.date_of_flight,
                    task_number: task.task_number,
                    aircraft_type: task.aircraft_type,
                    purpose: task.purpose
                  }
                }
              });
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-2 rounded text-xs w-full mt-1"
          >
            Activate
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TaskRow;
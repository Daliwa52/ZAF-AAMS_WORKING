import React from 'react';

const formatDate = (dateValue) => {
  if (!dateValue) return '';

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return dateValue.toString(); // Fallback for invalid dates

  let day = date.getDate();
  let month = date.getMonth() + 1; // JavaScript months are 0-based
  const year = date.getFullYear();

  // Add leading zero to day and month if necessary
  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;

  return `${day}/${month}/${year}`;
};

const formatTime = (timeValue) => {
  if (!timeValue) return '--:--';
  // If it's already in HH:MM format, return as-is
  if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}$/)) {
    return timeValue;
  }
  // Fallback for any unexpected format
  return '--:--';
};

const MovementsRow = ({ movement, onEdit }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="border px-2 py-1 text-center">{formatDate(movement.date_of_flight)}</td>
      <td className="border px-2 py-1 text-center">{movement.task_number || ''}</td>
      <td className="border px-2 py-1 text-center">{movement.call_sign || ''}</td>
      <td className="border px-2 py-1 text-center">{movement.aircraft_type || ''}</td>
      <td className="border px-2 py-1 text-center">{movement.dept_aerod || ''}</td>
      <td className="border px-2 py-1 text-center">{formatTime(movement.atd)}</td>
      <td className="border px-2 py-1 text-center">{movement.enroute_estimates || ''}</td>
      <td className="border px-2 py-1 text-center">{movement.dest_aerod || ''}</td>
      <td className="border px-2 py-1 text-center">{movement.purpose || ''}</td>
      <td className="border px-2 py-1 text-center">{formatTime(movement.ata)}</td>
      <td className="border px-2 py-1 text-center">{movement.occurrence_status || ''}</td>
      <td className="border px-2 py-1 text-center">{movement.remarks || ''}</td>
      <td className="border px-2 py-1 text-center">
        <button
          onClick={() => onEdit(movement)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs"
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

export default MovementsRow;
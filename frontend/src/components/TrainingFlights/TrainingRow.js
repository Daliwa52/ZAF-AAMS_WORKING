import React from 'react';

const formatTimeDisplay = (timeString) => {
  if (!timeString) return '';

  // Extract HH:MM from a potential HH:MM:SS format
  const match = timeString.match(/^(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }

  return timeString;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  let day = date.getDate();
  let month = date.getMonth() + 1; // JS months are zero-based
  const year = date.getFullYear();

  // Pad day and month with a leading zero if necessary
  day = day < 10 ? '0' + day : day;
  month = month < 10 ? '0' + month : month;

  return `${day}/${month}/${year}`;
};


const TrainingRow = ({ flight, onEdit }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="border px-2 py-1 text-center">{formatDate(flight.date_of_flight)}</td>
      <td className="border px-2 py-1 text-center">{flight.call_sign || ''}</td>
      <td className="border px-2 py-1 text-center">{flight.aircraft_type || ''}</td>
      <td className="border px-2 py-1 text-center">{formatTimeDisplay(flight.atd)}</td>
      <td className="border px-2 py-1 text-left">{flight.route || ''}</td>
      <td className="border px-2 py-1 text-center">{flight.duty || ''}</td>
      <td className="border px-2 py-1 text-left">{flight.crew || ''}</td>
      <td className="border px-2 py-1 text-center">{formatTimeDisplay(flight.ata)}</td>
      <td className="border px-2 py-1 text-center">{flight.total_flight_time || 'TBN'}</td>
      <td className="border px-2 py-1 text-center">
        <button
          onClick={() => onEdit(flight)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs"
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

export default TrainingRow;
import React from 'react';

const TimeInput = ({ value, onChange, ...props }) => {
  const handleChange = (e) => {
    const timeValue = e.target.value;
    onChange(timeValue);
  };

  return (
      <input
        type="time"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-2 py-1 w-full"
        step="60" // Force minute intervals
        {...props}
    />
  );
};

export default TimeInput;
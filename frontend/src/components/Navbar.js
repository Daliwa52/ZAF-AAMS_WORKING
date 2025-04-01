import React from 'react';

const Navbar = () => {
  return (
    <nav
      className="p-5"
      style={{
        background: 'linear-gradient(to right, white, #87CEEB, #1E90FF)', // White to sky blue to darker blue
      }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {/* ZAF emblem with white background */}
          <img
            src="/zaf-emblem.png"
            alt="ZAF Emblem"
            className="w-14 h-14"
            style={{ cursor: 'default' }}
            onClick={(e) => e.preventDefault()}
          />
        </div>

        {/* Centered title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-white text-4xl font-bold mb-1">ZAMBIA AIR FORCE</h1>
          <h2 className="text-white text-2xl">ADVANCED AIRCRAFT MANAGEMENT SYSTEM</h2>
        </div>

        <div className="flex items-center">
          {/* ZAF Roundel on right side */}
          <img
            src="/zaf-roundel.png"
            alt="ZAF Roundel"
            className="w-12 h-12"
            style={{ cursor: 'default' }}
            onClick={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
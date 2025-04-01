// SideMenu.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SideMenu = () => {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const navigate = useNavigate();

  const navigateToSection = (section) => {
    navigate(`/${section}`);
  };

  return (
    <>
      {/* Side Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-r from-blue-900/80 to-blue-800/70 backdrop-blur-sm text-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          showSideMenu ? 'translate-x-0' : '-translate-x-60'
        } border-r border-blue-400/30`}
        onMouseEnter={() => setShowSideMenu(true)}
        onMouseLeave={() => setShowSideMenu(false)}
      >
        <div className="p-4 bg-gradient-to-r from-blue-900/90 to-blue-800/80 border-b border-blue-400/30">
          <h3 className="text-lg font-bold text-center">QUICK NAVIGATION</h3>
        </div>

        <div className="p-4 space-y-3">
          <div
            className="p-3 hover:bg-blue-700/80 rounded-lg cursor-pointer transition-all duration-200 border border-blue-500/40 shadow-md flex items-center"
            onClick={() => navigateToSection('tasks')}
          >
            <div className="w-2 h-8 bg-orange-400 rounded-full mr-3"></div>
            <span>Aircraft Tasks</span>
          </div>
          <div
                      className="p-3 hover:bg-blue-700/80 rounded-lg cursor-pointer transition-all duration-200 border border-blue-500/40 shadow-md flex items-center"
                      onClick={() => navigateToSection('aircraft-movements')}
                    >
                      <div className="w-2 h-8 bg-blue-400 rounded-full mr-3"></div>
                      <span>Aircraft Movements</span>
                    </div>

          <div
            className="p-3 hover:bg-blue-700/80 rounded-lg cursor-pointer transition-all duration-200 border border-blue-500/40 shadow-md flex items-center"
            onClick={() => navigateToSection('training')}
          >
            <div className="w-2 h-8 bg-green-400 rounded-full mr-3"></div>
            <span>Training Flights</span>
          </div>
          <div
                      className="p-3 hover:bg-blue-700/80 rounded-lg cursor-pointer transition-all duration-200 border border-blue-500/40 shadow-md flex items-center"
                      onClick={() => navigateToSection('reports')}
                    >
                      <div className="w-2 h-8 bg-yellow-400 rounded-full mr-3"></div>
                      <span>Reports</span>
                    </div>
          <div
            className="p-3 hover:bg-blue-700/80 rounded-lg cursor-pointer transition-all duration-200 border border-blue-500/40 shadow-md flex items-center"
            onClick={() => navigateToSection('home')}
          >
            <div className="w-2 h-8 bg-red-400 rounded-full mr-3"></div>
            <span>Home Page</span>
          </div>
        </div>
       </div>

      {/* Side Menu Trigger Area */}
      <div
        className="fixed top-1/4 left-0 h-48 w-4 bg-gradient-to-r from-blue-900/80 to-blue-800/60 rounded-r-md cursor-pointer z-40 flex items-center justify-center backdrop-blur-sm"
        onMouseEnter={() => setShowSideMenu(true)}
      >
        <div className="w-1 h-16 bg-blue-300/80 rounded-full"></div>
      </div>
    </>
  );
};

export default SideMenu;

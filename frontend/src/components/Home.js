import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';  // Make sure you have a Home.css file in the same folder

const Home = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {

      const user = localStorage.getItem('currentUser') || 'Guest';
      setCurrentUser(user);
    }, []);

  const handleLogout = () => {
    // Clear any user session or token here
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('token');
    navigate('/'); // Redirect to login page
  };

   return (
      <div className="home-container">
        <header className="home-header">
         <div className="mb-6">
            <h3 className="text-center text-2xl font-bold text-gray-800">
             ZAF AAMS HOME PAGE
             </h3>
            <div className="border-b-2 border-gray-300 w-1/4 mx-auto mb-6"></div>
           </div>
        </header>

        <div className="home-grid">
          <div className="home-card" onClick={() => navigate('/tasks')}>
            <img
              src="/tasks-icon.png"
              alt="Tasks"
              className="home-image"
              style={{backgroundColor: '#f8f9fa'}} /* Optional: Add subtle background */
            />
            <p className="home-text">Aircraft Tasks</p>
          </div>

          <div className="home-card" onClick={() => navigate('/aircraft-movements')}>
            <img
              src="/movements-icon.png"
              alt="Movements"
              className="home-image"
              style={{backgroundColor: '#f8f9fa'}}
            />
            <p className="home-text">Aircraft Movements</p>
          </div>

          <div className="home-card" onClick={() => navigate('/training')}>
            <img
              src="/training-icon.png"
              alt="Training"
              className="home-image"
              style={{backgroundColor: '#f8f9fa'}}
            />
            <p className="home-text">Training Flights</p>
          </div>

          <div className="home-card" onClick={() => navigate('/reports')}>
            <img
              src="/reports-icon.png"
              alt="Reports"
              className="home-image"
              style={{backgroundColor: '#f8f9fa'}}
            />
            <p className="home-text">Reports</p>
          </div>
        </div>

      {/* Footer area: show username and Sign out link in one line */}
     <footer className="home-footer flex justify-between items-center text-sm text-gray-600">
       <span className="mr-1">Logged in as <span className="font-bold">{currentUser}</span></span>
       <span className="home-logout cursor-pointer" onClick={handleLogout}>Sign out</span>
     </footer>

         </div>
       );
     };

export default Home;
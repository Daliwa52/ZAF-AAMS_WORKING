import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { handleApiError } from '../utils/errorHandler';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  // List of aircraft images to display in the slideshow
  const aircraftImages = [
    '/aircraft/aircraft1.jpg',
    '/aircraft/aircraft2.png',
    '/aircraft/aircraft3.png',
    '/aircraft/aircraft4.png',
    '/aircraft/aircraft5.png',
    '/aircraft/aircraft6.png',
    '/aircraft/aircraft7.png',
  ];

  // Check for remembered login on component mount
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberMe') === 'true' ?
      localStorage.getItem('currentUser') : null;

    if (rememberedUser) {
      setUsername(rememberedUser);
      setRememberMe(true);
    }
  }, []);

  // Auto logout after inactivity (1 hour)
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (localStorage.getItem('currentUser')) {
          handleLogout();
          alert('You have been logged out due to inactivity.');
        }
      }, 60 * 60 * 1000); // 1 hour in milliseconds
    };

    // Events that reset the timer
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  // Slideshow effect - 5 seconds per image
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) =>
        prevImage === aircraftImages.length - 1 ? 0 : prevImage + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });

      if (response.data.message === 'Login successful') {
        // Store the username in localStorage
        localStorage.setItem('currentUser', username);

        // Store rememberMe preference in localStorage
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        // Set last activity timestamp
        localStorage.setItem('lastActivity', Date.now().toString());

        // Redirect to the home page
        navigate('/home');
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      handleApiError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    if (!rememberMe) {
      localStorage.removeItem('rememberMe');
    }
    localStorage.removeItem('lastActivity');
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url(/faint-emblem.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Content area */}
      <div className="flex flex-1 items-center justify-center p-6">
        {/* Left side - Aircraft slideshow */}
        <div className="w-3/5 p-4 flex justify-center items-center">
          <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-xl">
            {aircraftImages.map((img, index) => (
              <div
                key={index}
                className="absolute inset-0 transition-all duration-5000 ease-in-out"
                style={{
                  opacity: currentImage === index ? 1 : 0,
                  zIndex: currentImage === index ? 10 : 0,
                  transform: currentImage === index ? 'scale(1.05)' : 'scale(1)',
                  transition: 'opacity 1s ease-in-out, transform 5s ease-in-out'
                }}
              >
                <img
                  src={img}
                  alt={`ZAF Aircraft ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
              Zambia Air Force Aircraft Fleet
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-2/5 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex flex-col items-center mb-6">
              <img
                src="/zaf-emblem.png"
                alt="ZAF Emblem"
                className="w-20 h-20 object-contain mb-2"
              />
              <h2 className="text-xl font-bold text-gray-800">ZAF AAMS Login Portal</h2>
              <p className="text-sm text-gray-600 mt-1">
                Please login to access the system
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
            <div className="mt-4 text-center text-xs text-gray-500">
              *Never Share your credentials with anyone
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
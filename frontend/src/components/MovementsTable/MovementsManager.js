import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import MovementTableHeader from './MovementTableHeader';
import MovementTableBody from './MovementTableBody';
import EditMovementModal from './EditMovementModal';
import AddMovementModal from './AddMovementModal';
import Pagination from '../TaskTable/Pagination';
import SideMenu from '../SideMenu';

const MovementsManager = () => {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [isEditing, setIsEditing] = useState(false);
  const [currentMovement, setCurrentMovement] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [movementsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [shouldFilter, setShouldFilter] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Normalization function for search
   const normalizeText = (text) => {
      if (text === null || text === undefined) return '';
      return text.toString()
        .toLowerCase()
        .normalize("NFD")  // Handle accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[-\s]/g, '');
    };

  // Fetch movements from backend
  const fetchMovements = () => {
      axios.get('http://localhost:5000/api/movements')
        .then(response => {
          setMovements(response.data);
        })
        .catch(error => setError(error.message));
    };

  useEffect(() => {
    fetchMovements();
    const user = localStorage.getItem('currentUser') || 'Guest';
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setIsSearchActive(false);
      } else {
      setIsSearchActive(true);
      const results = searchMovements(searchTerm, movements);
      setFilteredMovements(results);
    }
    setCurrentPage(1);
  }, [searchTerm, movements, selectedDate]);

  // Search movements function
  const searchMovements = (term, movementsArray) => {
    const normalizedTerm = normalizeText(term);

    return movementsArray.filter(movement => {
      return (
        normalizeText(movement.task_number).includes(normalizedTerm) ||
        normalizeText(movement.call_sign).includes(normalizedTerm) ||
        normalizeText(movement.aircraft_type).includes(normalizedTerm) ||
        normalizeText(movement.dept_aerod).includes(normalizedTerm) ||
        normalizeText(movement.dest_aerod).includes(normalizedTerm) ||
        normalizeText(movement.occurrence_status).includes(normalizedTerm)
      );
    }).sort((a, b) => new Date(b.date_of_flight) - new Date(a.date_of_flight));
  };

  useEffect(() => {
      if (location.state?.movementData) {
         setIsAdding(true);
         setCurrentMovement({
           ...location.state.movementData,
         // Defaults first
         call_sign: '',
         dept_aerod: '',
         atd: '',
         enroute_estimates: '',
         dest_aerod: '',
         ata: '',
         occurrence_status: 'In Progress',
         remarks: '',
         // Normalize date format
         date_of_flight: location.state.movementData.date_of_flight?.split('T')[0] || new Date().toISOString().split('T')[0]
             });
           }
         }, [location]);
useEffect(() => {
  if (searchTerm.trim() === '') {
    setIsSearchActive(false);
    // When search is cleared, trigger date filtering
    setShouldFilter(true);
  } else {
    setIsSearchActive(true);
    const results = searchMovements(searchTerm, movements);
    setFilteredMovements(results);
  }
  setCurrentPage(1);
}, [searchTerm, movements]);

  // Date filter function
   useEffect(() => {
     const filterData = () => {
       let filtered = [...movements];

       // Always apply date filter when not searching
       if (searchTerm.trim() === '') {
         filtered = filtered.filter(movement => {
           const movementDate = movement.date_of_flight?.split('T')[0];
           return movementDate === selectedDate;
         });
       } else {
         // Apply search filter when there's a search term
         const normalizedTerm = normalizeText(searchTerm);
         filtered = movements.filter(movement => {
           return Object.entries(movement).some(([key, value]) => {
             if (['id', 'created_at', 'updated_at'].includes(key)) return false;
             if (typeof value === 'object') {
               return JSON.stringify(value).toLowerCase().includes(normalizedTerm);
             }
             return normalizeText(value).includes(normalizedTerm);
           });
         }).sort((a, b) => new Date(b.date_of_flight) - new Date(a.date_of_flight));
       }

       setFilteredMovements(filtered);
       setCurrentPage(1);
     };

     if (shouldFilter) {
       filterData();
       setShouldFilter(false);
     }
   }, [searchTerm, movements, shouldFilter, selectedDate]);

    // Handlers
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckMovements = () => {
    setSearchTerm('');
    setIsSearchActive(false);
    setShouldFilter(true); // Set this to true to trigger the filter
  };

  useEffect(() => {
    if (movements.length > 0) {
      setShouldFilter(true);
    }
  }, [movements]);

  // Navigation helper
  const handleNavigateHome = () => {
    navigate('/home');
  };

  // Handlers for editing and adding movements
  const handleEdit = (movement) => {
    setCurrentMovement({ ...movement });
    setIsEditing(true);
  };
const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this movement?')) {
    try {
      await axios.delete(`http://localhost:5000/api/movements/${id}`);
      fetchMovements();
      setIsEditing(false);
      setSuccessMessage('Movement deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Delete Error:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to delete movement');
    }
  }
};

   const handleAddMovement = () => {
     setIsAdding(true);
     setCurrentMovement({
       date_of_flight: new Date().toISOString().split('T')[0],
       task_number: '',
       call_sign: '',
       aircraft_type: '',
       dept_aerod: '',
       atd: '',
       enroute_estimates: '',
       dest_aerod: '',
       purpose: '',
       ata: '',
       occurrence_status: 'In Progress',
       remarks: ''
     });
   };


  // For pagination
   const indexOfLastMovement = currentPage * movementsPerPage;
    const indexOfFirstMovement = indexOfLastMovement - movementsPerPage;
    const currentMovements = filteredMovements.slice(indexOfFirstMovement, indexOfLastMovement);

  return (
    <div className="min-h-screen bg-gray-100">
      <SideMenu />
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-left text-sm text-gray-600">
            Logged in as <span className="font-bold">{currentUser}</span>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-center text-3xl font-bold text-gray-800">
             AIRCRAFT MOVEMENTS MANAGER
                      </h3>
                      <div className="border-b-2 border-gray-300 w-1/4 mx-auto mb-6"></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      {error && (
                        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">
                          {error}
                        </div>
                      )}
                      {successMessage && (
                        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
                          {successMessage}
                        </div>
                      )}
                      <MovementTableHeader
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                        onCheckMovements={handleCheckMovements}
                        onAddMovement={() => setIsAdding(true)}
                        onNavigateHome={() => navigate('/home')}
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                      />

                      {isSearchActive && (
                        <div className="mb-4 text-gray-700">
                          <p>
                            Showing {filteredMovements.length} results for "{searchTerm}"
                            sorted by date (newest first)
                          </p>
                        </div>
                      )}

                      <MovementTableBody
                        filteredMovements={currentMovements}
                        onEdit={handleEdit}
                      />

                      <Pagination
                        tasksPerPage={movementsPerPage}
                        totalTasks={filteredMovements.length}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                      />

          {isEditing && (
            <EditMovementModal
              isEditing={isEditing}
              currentMovement={currentMovement}
              onSave={async (updatedMovement) => {
                try {
                  await axios.put(`http://localhost:5000/api/movements/${updatedMovement.id}`, updatedMovement);
                  fetchMovements();
                  setIsEditing(false);
                  setSuccessMessage('Movement updated successfully');
                  setTimeout(() => setSuccessMessage(''), 3000);
                } catch (error) {
                  console.error('Error updating movement:', error);
                  setError(error.response?.data?.message || 'Failed to update movement');
                }
              }}
              onDelete={handleDelete} // Add this prop
                  onCancel={() => setIsEditing(false)}
                  onInputChange={(key, value) =>
                    setCurrentMovement(prev => ({ ...prev, [key]: value }))
                  }
                />
              )}
          {isAdding && (
            <AddMovementModal
              isAdding={isAdding}
              onAdd={(newMovement) => {
                axios.post('http://localhost:5000/api/movements', newMovement)
                  .then(() => {
                    fetchMovements();
                    setIsAdding(false);
                    setSuccessMessage('Movement added successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                  })
                  .catch(error => setError(error.message));
              }}
              onCancel={() => setIsAdding(false)}
              onInputChange={(key, value) => {
                setCurrentMovement(prev => ({
                  ...(prev || {}), // Handle initial null state
                  [key]: value
                }));
              }}
              initialData={currentMovement}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MovementsManager;
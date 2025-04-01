import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TrainingTableHeader from './TrainingTableHeader';
import TrainingTableBody from './TrainingTableBody';
import AddTrgModal from './AddTrgModal';
import EditTrgModal from './EditTrgModal';
import Pagination from '../TaskTable/Pagination';
import SideMenu from '../SideMenu';
import { handleApiError } from '../../utils/errorHandler';

const TrainingFlights = () => {
  // ---------------------- State Management ----------------------
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [isEditing, setIsEditing] = useState(false);
  const [currentFlight, setCurrentFlight] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [flightsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const navigate = useNavigate();

  // ---------------------- Data Fetching ----------------------
  const fetchFlights = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/training');
      setFlights(response.data);

      // Immediately filter flights for today's date after fetching
      const filtered = response.data.filter(flight =>
        flight.date_of_flight?.split('T')[0] === selectedDate
      );
      setFilteredFlights(filtered);
    } catch (error) {
      handleApiError(error, setError);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchFlights();
    const user = localStorage.getItem('currentUser') || 'Guest';
    setCurrentUser(user);
  }, []);

  // Handle search effect
  useEffect(() => {
    if (searchTerm.trim() === '') {
      if (isSearchActive) {
        // If search is cleared, reapply date filter
        const filtered = flights.filter(flight =>
          flight.date_of_flight?.split('T')[0] === selectedDate
        );
        setFilteredFlights(filtered);
        setIsSearchActive(false);
      }
    } else {
      // Apply search filtering
      const normalizedTerm = normalizeText(searchTerm);
      const results = flights.filter(flight =>
        Object.values(flight).some(value =>
          value && normalizeText(value).includes(normalizedTerm)
        )
      ).sort((a, b) => new Date(b.date_of_flight) - new Date(a.date_of_flight));

      setFilteredFlights(results);
      setIsSearchActive(true);
    }
    setCurrentPage(1);
  }, [searchTerm, flights]);

  // ---------------------- Handlers ----------------------
  const normalizeText = (text) => {
    if (!text) return '';
    return text.toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-\s]/g, '');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    // Date change itself doesn't filter the flights
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckFlights = () => {
    setSearchTerm('');
    setIsSearchActive(false);
    // Filter flights based on selected date when Check Flights is clicked
    const filtered = flights.filter(flight =>
      flight.date_of_flight?.split('T')[0] === selectedDate
    );
    setFilteredFlights(filtered);
    setCurrentPage(1);
  };

  // ---------------------- CRUD Operations ----------------------
  const handleEdit = (flight) => {
    setCurrentFlight({ ...flight });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this training flight?')) {
      try {
        await axios.delete(`http://localhost:5000/api/training/${id}`);
        setIsEditing(false); // Close the modal
        fetchFlights();
        setSuccessMessage('Training deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        handleApiError(error, setError);
      }
    }
  };

  const handleAddFlight = async (newFlight) => {
    try {
      const response = await axios.post('http://localhost:5000/api/training', newFlight);

      // After adding, refetch all flights
      const updatedResponse = await axios.get('http://localhost:5000/api/training');
      setFlights(updatedResponse.data);

      // Update selected date to match the new flight's date
      setSelectedDate(newFlight.date_of_flight.split('T')[0]);

      // Filter flights based on the new date
      const filtered = updatedResponse.data.filter(flight =>
        flight.date_of_flight?.split('T')[0] === newFlight.date_of_flight.split('T')[0]
      );
      setFilteredFlights(filtered);

      setIsAdding(false);
      setSuccessMessage('Training added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      handleApiError(error, setError);
    }
  };

  const handleSaveFlight = async (updatedFlight) => {
    try {
      await axios.put(`http://localhost:5000/api/training/${updatedFlight.id}`, updatedFlight);

      // After updating, refetch all flights
      const response = await axios.get('http://localhost:5000/api/training');
      setFlights(response.data);

      // Update selected date to match the edited flight's date
      setSelectedDate(updatedFlight.date_of_flight.split('T')[0]);

      // Filter flights based on the updated date
      const filtered = response.data.filter(flight =>
        flight.date_of_flight?.split('T')[0] === updatedFlight.date_of_flight.split('T')[0]
      );
      setFilteredFlights(filtered);

      setIsEditing(false);
      setSuccessMessage('Training updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      handleApiError(error, setError);
    }
  };

  // ---------------------- Render ----------------------
  const indexOfLastFlight = currentPage * flightsPerPage;
  const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
  const currentFlights = filteredFlights.slice(indexOfFirstFlight, indexOfLastFlight);

  return (
    <div className="container mx-auto px-4 py-4">
      <SideMenu />
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Logged in as <span className="font-bold">{currentUser}</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-center text-3xl font-bold text-gray-800">
          TRAINING FLIGHTS MANAGER
        </h3>
        <div className="border-b-2 border-gray-300 w-1/4 mx-auto mb-6"></div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4">
        {/* Error/Success Messages */}
        {error && (
          <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>
        )}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
            {successMessage}
          </div>
        )}

        {/* Table Header */}
        <TrainingTableHeader
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onCheckFlights={handleCheckFlights}
          onAddFlight={() => setIsAdding(true)}
          onNavigateHome={() => navigate('/home')}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* Search Status */}
        {isSearchActive && (
          <div className="mb-4 text-gray-700">
            Showing {filteredFlights.length} results for "{searchTerm}"
          </div>
        )}

        {/* Table Body */}
        <TrainingTableBody
          flights={currentFlights}
          onEdit={handleEdit}
        />

        {/* Pagination */}
        {filteredFlights.length > flightsPerPage && (
          <Pagination
            tasksPerPage={flightsPerPage}
            totalTasks={filteredFlights.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}

        {/* Modals */}
        {isEditing && (
          <EditTrgModal
            isEditing={isEditing}
            currentFlight={currentFlight}
            onSave={handleSaveFlight}
            onCancel={() => setIsEditing(false)}
            onDelete={handleDelete}
          />
        )}

        {isAdding && (
          <AddTrgModal
            isAdding={isAdding}
            onAdd={handleAddFlight}
            onCancel={() => setIsAdding(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TrainingFlights;
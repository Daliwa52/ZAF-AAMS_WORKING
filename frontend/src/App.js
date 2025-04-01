// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';     // Example login component
import Home from './components/Home';
import TaskTable from './components/TaskTable/TaskTable';
import Reports from './components/Reports/Reports';
import MovementsManager from './components/MovementsTable/MovementsManager';
import TrainingFlights from './components/TrainingFlights/TrainingFlights';
import ForgotPassword from './components/ForgotPassword';

function App() {
  return (
    <Router>
    <Navbar />
      <Routes>
        {/* The default route ("/") could show Login, or Home, etc. */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tasks" element={<TaskTable />} />
        <Route path="/aircraft-movements" element={<MovementsManager />} />
        <Route path="/training" element={<TrainingFlights />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/forgot-password" element={<ForgotPassword />}/>

        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

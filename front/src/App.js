import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Patients from './components/Patients';
import Appointments from './components/Appointments';
import Medication from './components/Medications';
import AdminLogin from './components/AdminLogin';
import NavigationBar from './components/Navbar';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false); // Set loading to false once the token is checked
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  if (loading) {
    // Avoid rendering anything until authentication status is confirmed
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <NavigationBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/appointments" replace /> : <AdminLogin />} />
        <Route
          path="/patients"
          element={isAuthenticated ? <Patients /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/appointments"
          element={isAuthenticated ? <Appointments /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/medications"
          element={isAuthenticated ? <Medication /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/appointments" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;

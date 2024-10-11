import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Patients from './Patients';
import Appointments from './Appointments';
import Medication from './Medications';
import AdminLogin from './AdminLogin';
import Loading from './Loading';  // Import the Loading component
import Home from './home';  // Import the Loading component

const AppRoutes = ({ isAuthenticated }) => {
  const [pageLoading, setPageLoading] = useState(false); // Add loading state for page transitions
  const location = useLocation();

  // Track route changes for page loading
  useEffect(() => {
    setPageLoading(true); // Set loading true on route change

    const timeout = setTimeout(() => {
      setPageLoading(false); // Disable loading after a short delay to simulate data fetching
    }, 500); // Simulate a 1 second loading delay

    return () => clearTimeout(timeout); // Cleanup timeout on unmount
  }, [location]);

  return pageLoading ? ( // Show loading animation during route transitions
    <Loading />
  ) : (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/appointments" replace /> : <AdminLogin />} />
      <Route path="/patients" element={isAuthenticated ? <Patients /> : <Navigate to="/login" replace />} />
      <Route path="/appointments" element={isAuthenticated ? <Appointments /> : <Navigate to="/login" replace />} />
      <Route path="/medications" element={isAuthenticated ? <Medication /> : <Navigate to="/login" replace />} />
      <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/appointments" : "/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;

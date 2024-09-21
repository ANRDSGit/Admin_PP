import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import NavigationBar from './components/Navbar';
import AppRoutes from './components/AppRoutes'; // Import the new child component
import Loading from './components/Loading';  // Import the Loading component

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state for authentication

  // Handle authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false); // Stop authentication loading
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  if (loading) {
    // Show initial loading spinner while checking authentication status
    return <Loading />;
  }

  return (
    <Router>
      <NavigationBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <AppRoutes isAuthenticated={isAuthenticated} />
    </Router>
  );
};

export default App;

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const NavigationBar = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const getLinkStyle = (path) => ({
    color: location.pathname === path ? 'Black' : 'white', // Highlight color for the active link
    textDecoration: 'none',
  });

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          My Application
        </Typography>
        {isAuthenticated ? (
          <>
            <Button color="inherit" component={Link} to="/patients" style={getLinkStyle('/patients')}>
              Patients
            </Button>
            <Button color="inherit" component={Link} to="/appointments" style={getLinkStyle('/appointments')}>
              Appointments
            </Button>
            <Button color="inherit" component={Link} to="/medications" style={getLinkStyle('/medications')}>
              Medications
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login" style={getLinkStyle('/login')}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;

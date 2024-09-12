import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const NavigationBar = ({ isAuthenticated, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Use media query to detect small screen

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const getLinkStyle = (path) => ({
    color: location.pathname === path ? 'black' : 'inherit', // Highlight color for the active link
    textDecoration: 'none',
  });

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const drawerContent = (
    <List>
      {isAuthenticated ? (
        <>
          <ListItem
            button
            component={Link}
            to="/patients"
            onClick={toggleDrawer(false)}
            style={location.pathname === '/patients' ? { backgroundColor: '#f0f0f0' } : {}}
          >
            <ListItemText primary="Patients" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/appointments"
            onClick={toggleDrawer(false)}
            style={location.pathname === '/appointments' ? { backgroundColor: '#f0f0f0' } : {}}
          >
            <ListItemText primary="Appointments" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/medications"
            onClick={toggleDrawer(false)}
            style={location.pathname === '/medications' ? { backgroundColor: '#f0f0f0' } : {}}
          >
            <ListItemText primary="Medications" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItem>
        </>
      ) : (
        <ListItem
          button
          component={Link}
          to="/login"
          onClick={toggleDrawer(false)}
          style={location.pathname === '/login' ? { backgroundColor: '#f0f0f0' } : {}}
        >
          <ListItemText primary="Login" />
        </ListItem>
      )}
    </List>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        {isSmallScreen ? (
          <>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
              <div
                role="presentation"
                onClick={toggleDrawer(false)}
                onKeyDown={toggleDrawer(false)}
                style={{ width: 250 }}
              >
                {drawerContent}
              </div>
            </Drawer>
          </>
        ) : (
          <>
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
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;

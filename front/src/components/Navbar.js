import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NavigationBar = ({ isAuthenticated, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // For notifications menu
  const [notifications, setNotifications] = useState([
    'New message from Doctor Smith',
    'Appointment reminder for tomorrow',
    'New lab results available'
  ]); // Example notifications
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const getLinkStyle = (path) => ({
    color: location.pathname === path ? 'black' : 'inherit',
    textDecoration: 'none',
  });

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const drawerContent = (
    <List>
      {isAuthenticated ? (
        <>
          <ListItem
            button
            component={Link}
            to="/home"
            onClick={toggleDrawer(false)}
            style={location.pathname === '/home' ? { backgroundColor: '#f0f0f0' } : {}}
          >
            <ListItemText primary="Home" />
          </ListItem>
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

  // Effect to update the live time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

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
              Patient Pulse
            </Typography>

            {/* Live Date and Time in a Box */}
            <Box
              sx={{
                border: 'none',
                borderRadius: '5px',
                padding: '0.5rem',
                marginRight: '1rem',
                backgroundColor: '#00AE48FF',
              }}
            >
              <Typography variant="body2">
                {currentDateTime.toLocaleDateString()} {currentDateTime.toLocaleTimeString()}
              </Typography>
            </Box>

            {/* Notification Icon with Badge */}
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              sx={{ marginRight: '1rem' }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Notification Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleNotificationClose}
            >
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <MenuItem key={index} onClick={handleNotificationClose}>
                    {notification}
                  </MenuItem>
                ))
              ) : (
                <MenuItem onClick={handleNotificationClose}>No new notifications</MenuItem>
              )}
            </Menu>

            {isAuthenticated ? (
              <>
                <Button color="inherit" component={Link} to="/home" style={getLinkStyle('/home')}>
                  Dashboard
                </Button>
                <Button color="inherit" component={Link} to="/patients" style={getLinkStyle('/patients')}>
                  Patients
                </Button>
                <Button color="inherit" component={Link} to="/appointments" style={getLinkStyle('/appointments')}>
                  Appointments
                </Button>
                <Button color="inherit" onClick={() => window.location.href = 'http://localhost:5173/'}>
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

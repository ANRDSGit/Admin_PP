import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Box, Typography, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { keyframes } from '@emotion/react';

// Define the animation using keyframes
const slideDown = keyframes`
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for showing password
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/appointments');
    }
  }, [navigate]);

  const handleLogin = () => {
    axios.post(`${apiBaseUrl}/admin/login`, { username, password })
      .then((response) => {
        localStorage.setItem('token', response.data.token);
        navigate('/appointments');
        window.location.reload();
      })
      .catch((err) => {
        setError('Invalid credentials');
        console.error(err);
      });
  };

  return (
    <Box display="flex" flexDirection="column" p={2} alignItems="center">
      {/* Animated Top Header */}
      <Box
        sx={{
          animation: `${slideDown} 1s ease`,
          mb: 4,
          width: '100%',
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" color="primary">
          Welcome to Admin Panel
        </Typography>

        {/* Add a GIF after the welcome text */}
        <img
          src="/animation.gif" // Example GIF, replace with your own URL
          alt="Welcome Animation"
          style={{
            width: '350px', // Adjust width as needed
            height: 'auto',
            marginTop: '20px',
          }}
        />
      </Box>

      <Box display="flex" flexDirection="column" maxWidth={400} width="100%">
        <Typography variant="h4" mb={2}>Admin Login</Typography>
        {error && <Typography color="error">{error}</Typography>}
        
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'} // Conditionally render password visibility
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default AdminLogin;

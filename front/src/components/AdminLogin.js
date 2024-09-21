import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Box, Typography } from '@mui/material';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  

  useEffect(() => {
    // Check if there's already a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Redirect to the appointments tab if the user is already logged in
      navigate('/appointments');
    }
  }, [navigate]);

  const handleLogin = () => {
    
    axios.post(`${apiBaseUrl}/admin/login`, { username, password })
      .then((response) => {
        localStorage.setItem('token', response.data.token); // Save token in localStorage
        navigate('/appointments'); // Redirect to the appointments page
        window.location.reload();  // Reload the page after navigation
      })
      .catch((err) => {
        setError('Invalid credentials');
        console.error(err);
      });
  };

  return (
    <Box display="flex" flexDirection="column" p={2}>
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
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login
      </Button>
    </Box>
  );
};

export default AdminLogin;

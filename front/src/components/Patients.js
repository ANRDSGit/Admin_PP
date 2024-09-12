import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Button, TextField, MenuItem, Select, CircularProgress, Grid, Paper } from '@mui/material';

const App = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: '', bloodGroup: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token'); // Retrieve token from localStorage or other secure storage

  // Fetch all patients
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/patients', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setPatients(res.data);
    })
    .catch((err) => {
      setError('Error fetching patients');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [token]);

  // Create new patient
  const handleCreate = () => {
    setLoading(true);
    axios.post('http://localhost:5000/patients', {
      ...newPatient,
      age: Number(newPatient.age),
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setPatients([...patients, res.data.patient]);
      setNewPatient({ name: '', age: '', gender: '', bloodGroup: '', password: '' }); // Reset after creation
    })
    .catch((err) => {
      setError('Error creating patient');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Search patients
  const handleSearch = () => {
    setLoading(true);
    axios.get(`http://localhost:5000/patients/search/${searchTerm}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setPatients(res.data);
    })
    .catch((err) => {
      setError('Error searching patients');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Delete patient
  const handleDelete = (id) => {
    setLoading(true);
    axios.delete(`http://localhost:5000/patients/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setPatients(patients.filter((p) => p._id !== id));
    })
    .catch((err) => {
      setError('Error deleting patient');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Patient Dashboard
      </Typography>

      {/* Error message */}
      {error && <Typography color="error" mb={2}>{error}</Typography>}

      {/* Loading indicator */}
      {loading && <CircularProgress />}

      {/* Search bar */}
      <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <TextField
            label="Search Patients"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button variant="contained" color="primary" onClick={handleSearch} fullWidth>
            Search
          </Button>
        </Grid>
      </Grid>

      {/* Form to add new patient */}
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom textAlign="center">Add New Patient</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Name"
              value={newPatient.name}
              onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Age"
              value={newPatient.age}
              onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Select
              value={newPatient.gender}
              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
              fullWidth
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Blood Group"
              value={newPatient.bloodGroup}
              onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Password" // New input for password
              type="password"
              value={newPatient.password}
              onChange={(e) => setNewPatient({ ...newPatient, password: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="contained" color="primary" onClick={handleCreate} fullWidth>
              Add Patient
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Patients table */}
      {!loading && (
        <Box sx={{ height: { xs: 300, md: 400 } }}>
          <DataGrid
            rows={patients.map((patient) => ({
              ...patient,
              id: patient._id, // Ensure proper id mapping
            }))}
            columns={[
              { field: 'name', headerName: 'Patient Name', width: 150 },
              { field: 'age', headerName: 'Age', width: 100 },
              { field: 'gender', headerName: 'Gender', width: 100 },
              { field: 'bloodGroup', headerName: 'Blood Group', width: 120 },
              {
                field: 'actions',
                headerName: 'Actions',
                width: 150,
                renderCell: (params) => (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(params.row.id)}
                  >
                    Delete
                  </Button>
                ),
              },
            ]}
            pageSize={5}
            rowsPerPageOptions={[5]}
            autoHeight
          />
        </Box>
      )}
    </Box>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Button, TextField, CircularProgress, Grid, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: '', bloodGroup: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // Dialog state
  const [patientToDelete, setPatientToDelete] = useState(null); // Track which patient to delete
  const token = localStorage.getItem('token');
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    setLoading(true);
    axios.get(`${apiBaseUrl}/patients`, {
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
    axios.post(`${apiBaseUrl}/patients`, {
      ...newPatient,
      age: Number(newPatient.age),
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setPatients([...patients, res.data.patient]);
      setNewPatient({ name: '', age: '', gender: '', bloodGroup: '', password: '' }); // Reset form
    })
    .catch((err) => {
      setError('Error creating patient');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Add fingerprint
  const handleAddFingerpint = (id) => {
    // axios.get(`${apiBaseUrl}/patients/${id}`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // .then((res) => {
    //   setPatientId(res.data.)
    // const payload = {
    //   DeviceMode:"signup",
    // axios.post(`${apiBaseUrl}/patients/${id}/fingerprint`, )
  }

  // Search patients
  const handleSearch = () => {
    setLoading(true);
    axios.get(`${apiBaseUrl}/patients/search/${searchTerm}`, {
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

  // Open confirmation dialog for deletion
  const handleDeleteConfirmation = (id) => {
    setPatientToDelete(id);
    setConfirmDialogOpen(true);
  };

  // Delete patient after confirmation
  const handleDelete = () => {
    setLoading(true);
    axios.delete(`${apiBaseUrl}/patients/${patientToDelete}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setPatients(patients.filter((p) => p._id !== patientToDelete));  // Remove patient from list
      setConfirmDialogOpen(false);  // Close the dialog after deletion
    })
    .catch((err) => {
      setError('Error deleting patient');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Update patient's age
  const handleAgeUpdate = (id, age) => {
    setLoading(true);
    axios.put(`${apiBaseUrl}/patients/${id}`, { age: Number(age) }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setPatients(patients.map((p) => (p._id === id ? res.data : p)));
      setEditingPatient(null); // Reset after updating
    })
    .catch((err) => {
      setError('Error updating patient age');
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

      {error && <Typography color="error" mb={2}>{error}</Typography>}

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
              type="number"
              value={newPatient.age}
              onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={newPatient.gender}
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Blood Group</InputLabel>
              <Select
                value={newPatient.bloodGroup}
                onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
              >
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Password"
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
              id: patient._id,
            }))}
            columns={[
              { field: 'name', headerName: 'Patient Name', width: 150 },
              {
                field: 'age',
                headerName: 'Age',
                width: 100,
                renderCell: (params) => {
                  const isEditing = editingPatient === params.row.id;
                  return isEditing ? (
                    <TextField
                      type="number"
                      value={params.row.age}
                      onChange={(e) =>
                        setPatients(patients.map((p) =>
                          p._id === params.row.id ? { ...p, age: e.target.value } : p
                        ))
                      }
                    />
                  ) : (
                    params.row.age
                  );
                },
              },
              { field: 'gender', headerName: 'Gender', width: 100 },
              { field: 'bloodGroup', headerName: 'Blood Group', width: 120 },
              {
                field: 'actions',
                headerName: 'Actions',
                width: 500,
                renderCell: (params) => (
                  <>
                    {editingPatient === params.row.id ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAgeUpdate(params.row.id, params.row.age)}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setEditingPatient(params.row.id)}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDeleteConfirmation(params.row.id)}
                      sx={{ ml: 1 }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleAddFingerpint(params.row.id)}
                      sx={{ ml: 1 }}
                    >
                      Add Fingerprint
                    </Button>
                  </>
                ),
              },
            ]}
            pageSize={5}
            rowsPerPageOptions={[5]}
            autoHeight
          />
        </Box>
      )}

      {/* Confirmation dialog for deletion */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this patient? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast container */}
    </Box>
  );
};

export default App;

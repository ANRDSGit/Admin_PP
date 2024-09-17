import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box, Typography, Button, TextField, CircularProgress, MenuItem, Paper, Grid,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Switch, FormControlLabel, Select, InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]); // To store patients from the database
  const [newAppointment, setNewAppointment] = useState({
    patientId: '', // Use patient ID for the appointment
    date: '',
    time: '',
    appointmentType: 'physical',
  });
  const [updateAppointment, setUpdateAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPhysicalView, setIsPhysicalView] = useState(true); // Toggle for physical and remote view
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // Confirmation dialog
  const [selectedDeleteId, setSelectedDeleteId] = useState(null); // Store selected ID for deletion
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const refreshPage = () => {
    const hasRefreshed = localStorage.getItem('hasRefreshed');
    if (!hasRefreshed) {
      localStorage.setItem('hasRefreshed', 'true');
      window.location.reload();
    }
  };

  useEffect(() => {
    refreshPage();
  }, []);

  useEffect(() => {
    setLoading(true);

    // Fetch appointments
    axios
      .get('http://localhost:5000/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAppointments(res.data);
      })
      .catch((err) => {
        setError('Error fetching appointments');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch patients
    axios
      .get('http://localhost:5000/patients', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPatients(res.data); // Save the list of patients
      })
      .catch((err) => {
        setError('Error fetching patients');
        console.error(err);
      });
  }, [token]);

  const handleCreate = () => {
    setLoading(true);
    axios
      .post('http://localhost:5000/appointments', newAppointment, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAppointments([...appointments, res.data]);
        setNewAppointment({ patientId: '', date: '', time: '', appointmentType: 'physical' });
      })
      .catch((err) => {
        setError('Error creating appointment');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearch = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/appointments/search/${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAppointments(res.data);
      })
      .catch((err) => {
        setError('Error searching appointments');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    setLoading(true);
    axios
      .delete(`http://localhost:5000/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setAppointments(appointments.filter((apt) => apt._id !== id));
        setConfirmDialogOpen(false);
      })
      .catch((err) => {
        setError('Error deleting appointment');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRedirectRemote = (id) => {
    navigate(`/remote/${id}`);
  };

  const handleEdit = (appointment) => {
    setUpdateAppointment(appointment);
  };

  const handleUpdate = () => {
    if (!updateAppointment) return;

    setLoading(true);
    axios
      .put(`http://localhost:5000/appointments/${updateAppointment._id}`, updateAppointment, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAppointments(appointments.map((apt) => (apt._id === res.data._id ? res.data : apt)));
        setUpdateAppointment(null);
      })
      .catch((err) => {
        setError('Error updating appointment');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const openConfirmDialog = (id) => {
    setSelectedDeleteId(id);
    setConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedDeleteId(null);
  };

  const physicalAppointments = appointments.filter((apt) => apt.appointmentType === 'physical');
  const remoteAppointments = appointments.filter((apt) => apt.appointmentType === 'remote');

  const currentAppointments = isPhysicalView ? physicalAppointments : remoteAppointments;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Appointments
      </Typography>

      <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Search by patient name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button variant="contained" onClick={handleSearch} fullWidth>
            Search
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={!isPhysicalView}
              onChange={() => setIsPhysicalView(!isPhysicalView)}
              color="primary"
            />
          }
          label={isPhysicalView ? 'Switch to Remote Appointments' : 'Switch to Physical Appointments'}
        />
      </Box>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom textAlign="center">
          Create New {isPhysicalView ? 'Physical' : 'Remote'} Appointment
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={4}>
            {/* Patient Dropdown */}
            <FormControl fullWidth>
              <InputLabel>Patient</InputLabel>
              <Select
                value={newAppointment.patientId}
                onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })}
              >
                {patients.map((patient) => (
                  <MenuItem key={patient._id} value={patient._id}>
                    {patient.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Time"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="contained" onClick={handleCreate} fullWidth>
              Create Appointment
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom textAlign="center">
            {isPhysicalView ? 'Physical' : 'Remote'} Appointments
          </Typography>

          <DataGrid
            rows={currentAppointments}
            columns={[
              { field: 'patientName', headerName: 'Patient Name', width: 200 },
              { field: 'date', headerName: 'Date', width: 150 },
              { field: 'time', headerName: 'Time', width: 150 },
              {
                field: 'actions',
                headerName: 'Actions',
                renderCell: (params) => (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(params.row)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => openConfirmDialog(params.row._id)}
                    >
                      Delete
                    </Button>
                    {!isPhysicalView && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleRedirectRemote(params.row._id)}
                        sx={{ ml: 1 }}
                      >
                        Start Remote
                      </Button>
                    )}
                  </>
                ),
                width: 400,
              },
            ]}
            pageSize={5}
            rowsPerPageOptions={[5]}
            autoHeight
            getRowId={(row) => row._id}
          />
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={closeConfirmDialog}
      >
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button
            onClick={() => handleDelete(selectedDeleteId)}
            color="secondary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default Appointments;

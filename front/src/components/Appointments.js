import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Button, TextField, CircularProgress, MenuItem, Paper, Grid, Tabs, Tab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    date: '',
    time: '',
    appointmentType: 'physical',
  });
  const [patients, setPatients] = useState([]);
  const [updateAppointment, setUpdateAppointment] = useState(null);  // Appointment being updated
  const [editedAppointment, setEditedAppointment] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);  // Dialog state
  const [deletingAppointment, setDeletingAppointment] = useState(null);  // Appointment to delete
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');  // Success message for Snackbar
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

  // Fetch patients when the component loads
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

  // Fetch appointments when the component loads
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/appointments', {
      headers: { Authorization: `Bearer ${token}` }
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
  }, [token]);

  const handleCreate = () => {
    setLoading(true);
    axios.post('http://localhost:5000/appointments', newAppointment, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setAppointments([...appointments, res.data]);
      setNewAppointment({ patientName: '', date: '', time: '', appointmentType: 'physical' });
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
    axios.get(`http://localhost:5000/appointments/search/${searchTerm}`, {
      headers: { Authorization: `Bearer ${token}` }
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
    setOpenDialog(true);
    setDeletingAppointment(id);
  };

  const confirmDelete = () => {
    setLoading(true);
    axios.delete(`http://localhost:5000/appointments/${deletingAppointment}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setAppointments(appointments.filter((apt) => apt._id !== deletingAppointment));
      setSuccessMessage('Appointment successfully deleted');
    })
    .catch((err) => {
      setError('Error deleting appointment');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
      setOpenDialog(false);
      setDeletingAppointment(null);
    });
  };

  const handleRedirectRemote = (id) => {
    navigate(`/remote/${id}`);
  };

  const handleEdit = (appointment) => {
    setUpdateAppointment(appointment);
    setEditedAppointment({
      date: appointment.date,
      time: appointment.time,
      appointmentType: appointment.appointmentType
    });
    setOpenEditDialog(true);  // Open the edit modal
  };

  const handleUpdate = () => {
    setLoading(true);
    axios.put(`http://localhost:5000/appointments/${updateAppointment._id}`, editedAppointment, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setAppointments(appointments.map(apt => (apt._id === res.data._id ? res.data : apt)));
      setSuccessMessage('Appointment successfully updated');
    })
    .finally(() => {
      setOpenEditDialog(false);
      setLoading(false);
    });
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };
  const physicalAppointments = appointments.filter((apt) => apt.appointmentType === 'physical');
  const remoteAppointments = appointments.filter((apt) => apt.appointmentType === 'remote');

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
          <Button variant="contained" onClick={handleSearch} fullWidth>Search</Button>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom textAlign="center">Create New Appointment</Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Patient Name"
              value={newAppointment.patientName}
              onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
              fullWidth
            >
              {patients.map((patient) => (
                <MenuItem key={patient._id} value={patient.name}>
                  {patient.name}
                </MenuItem>
              ))}
            </TextField>
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
            <TextField
              select
              label="Appointment Type"
              value={newAppointment.appointmentType}
              onChange={(e) => setNewAppointment({ ...newAppointment, appointmentType: e.target.value })}
              fullWidth
            >
              <MenuItem value="physical">Physical</MenuItem>
              <MenuItem value="remote">Remote</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="contained" onClick={handleCreate} fullWidth>Create Appointment</Button>
          </Grid>
        </Grid>
      </Paper>

      <Tabs
        value={tabIndex}
        onChange={(e, newValue) => setTabIndex(newValue)}
        centered
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Physical Appointments" />
        <Tab label="Remote Appointments" />
      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {tabIndex === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Physical Appointments
              </Typography>
              <DataGrid
                rows={physicalAppointments}
                columns={[
                  { field: 'patientName', headerName: 'Patient Name', width: 150 },
                  { field: 'date', headerName: 'Date', width: 150 },
                  { field: 'time', headerName: 'Time', width: 150 },
                  {
                    field: 'actions',
                    headerName: 'Actions',
                    renderCell: (params) => (
                      <Box>
                        <Button variant="outlined" onClick={() => handleEdit(params.row)}>Edit</Button>
                        <Button variant="outlined" color="error" onClick={() => handleDelete(params.row._id)}>Delete</Button>
                      </Box>
                    ),
                    width: 250
                  }
                ]}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row._id}
              />
            </Box>
          )}
          {tabIndex === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Remote Appointments
              </Typography>
              <DataGrid
                rows={remoteAppointments}
                columns={[
                  { field: 'patientName', headerName: 'Patient Name', width: 150 },
                  { field: 'date', headerName: 'Date', width: 150 },
                  { field: 'time', headerName: 'Time', width: 150 },
                  {
                    field: 'actions',
                    headerName: 'Actions',
                    renderCell: (params) => (
                      <Box>
                        <Button variant="outlined" onClick={() => handleRedirectRemote(params.row._id)}>Start Remote</Button>
                        <Button variant="outlined" onClick={() => handleEdit(params.row)}>Edit</Button>
                        <Button variant="outlined" color="error" onClick={() => handleDelete(params.row._id)}>Delete</Button>
                      </Box>
                    ),
                    width: 350
                  }
                ]}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row._id}
              />
            </Box>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to delete this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Appointment</DialogTitle>
        <DialogContent>
          <TextField
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={editedAppointment.date}
            onChange={(e) => setEditedAppointment({ ...editedAppointment, date: e.target.value })}
            margin="dense"
          />
          <TextField
            label="Time"
            type="time"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={editedAppointment.time}
            onChange={(e) => setEditedAppointment({ ...editedAppointment, time: e.target.value })}
            margin="dense"
          />
          <TextField
            select
            label="Appointment Type"
            value={editedAppointment.appointmentType}
            onChange={(e) => setEditedAppointment({ ...editedAppointment, appointmentType: e.target.value })}
            fullWidth
            margin="dense"
          >
            <MenuItem value="physical">Physical</MenuItem>
            <MenuItem value="remote">Remote</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </Box>
  );
};

export default Appointments;

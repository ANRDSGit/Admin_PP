import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Button, TextField, CircularProgress, MenuItem, Paper, Grid, Tabs, Tab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { makeStyles } from '@mui/styles';

// Define a styles object
const useStyles = makeStyles(() => ({
  centerCell: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
}));

const Appointments = () => {
  const classes = useStyles();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  // Function to get today's date in the format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    date: '',
    time: '',
    appointmentType: 'physical',
  });
  const [patients, setPatients] = useState([]);
  const [updateAppointment, setUpdateAppointment] = useState(null);
  const [editedAppointment, setEditedAppointment] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [remoteLink, setRemoteLink] = useState(''); // Shared link input
  const [selectedDate, setSelectedDate] = useState(getTodayDate()); // Date for filtering appointments

  // Fetch all appointments and patients
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [patientsRes, appointmentsRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${apiBaseUrl}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setPatients(patientsRes.data);
      setAppointments(appointmentsRes.data);
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token, apiBaseUrl]);

  // Debounced search for appointments by patient name
  const debouncedSearch = useCallback(
    debounce((term) => {
      setLoading(true);
      axios.get(`${apiBaseUrl}/appointments/search/${term}`, {
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
    }, 500),
    [token, apiBaseUrl]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value === '') {
      fetchAllData();
    } else {
      debouncedSearch(value);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${apiBaseUrl}/appointments`, newAppointment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments((prev) => [...prev, res.data]);
      setNewAppointment({ patientName: '', date: '', time: '', appointmentType: 'physical' });
    } catch (err) {
      setError('Error creating appointment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setOpenDialog(true);
    setDeletingAppointment(id);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${apiBaseUrl}/appointments/${deletingAppointment}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments((prev) => prev.filter((apt) => apt._id !== deletingAppointment));
      setSuccessMessage('Appointment successfully deleted');
    } catch (err) {
      setError('Error deleting appointment');
      console.error(err);
    } finally {
      setLoading(false);
      setOpenDialog(false);
      setDeletingAppointment(null);
    }
  };

  const handleEdit = (appointment) => {
    setUpdateAppointment(appointment);
    setEditedAppointment({
      date: appointment.date,
      time: appointment.time,
      appointmentType: appointment.appointmentType
    });
    setOpenEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await axios.put(`${apiBaseUrl}/appointments/${updateAppointment._id}`, editedAppointment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === res.data._id ? res.data : apt))
      );
      setSuccessMessage('Appointment successfully updated');
    } catch (err) {
      setError('Error updating appointment');
      console.error(err);
    } finally {
      setOpenEditDialog(false);
      setLoading(false);
    }
  };

  // Handle adding remote link and saving it to the database
  const handleRedirectRemote = async (id) => {
    try {
      setLoading(true);
      const appointment = appointments.find((apt) => apt._id === id);
      await axios.put(`${apiBaseUrl}/appointments/${id}/link`, {
        patientName: appointment.patientName,
        remoteLink  // Use the same shared link input for all appointments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Link successfully saved');
    } catch (err) {
      setError('Error saving link');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSuccessMessage('');

  // Physical appointments filtering logic
  const physicalAppointments = useMemo(() => {
    if (searchTerm) {
      return appointments.filter((apt) =>
        apt.appointmentType === 'physical' && apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return appointments.filter((apt) =>
      apt.appointmentType === 'physical' && new Date(apt.date).toISOString().split('T')[0] === selectedDate
    );
  }, [appointments, searchTerm, selectedDate]);

  // Remote appointments filtering logic
  const remoteAppointments = useMemo(() => {
    if (searchTerm) {
      return appointments.filter((apt) =>
        apt.appointmentType === 'remote' && apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return appointments.filter((apt) =>
      apt.appointmentType === 'remote' && new Date(apt.date).toISOString().split('T')[0] === selectedDate
    );
  }, [appointments, searchTerm, selectedDate]);

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
            onChange={handleSearchChange}
            fullWidth
          />
        </Grid>
      </Grid>

      {/* Date Picker */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Select Date</Typography>
        <TextField
          label="Select Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </Box>

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
          <Grid item xs={12} md={4}>
            <TextField
              label="Date"
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Time"
              type="time"
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreate}
              fullWidth
            >
              Create Appointment
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Tabs value={tabIndex} onChange={(_, index) => setTabIndex(index)} centered>
        <Tab label="Physical Appointments" />
        <Tab label="Remote Appointments" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {loading ? <CircularProgress /> : (
          <DataGrid
            rows={tabIndex === 0 ? physicalAppointments : remoteAppointments}
            columns={[
              { field: 'patientName', headerName: 'Patient Name', width: 200 },
              { field: 'date', headerName: 'Date', width: 150 },
              { field: 'time', headerName: 'Time', width: 100 },
              { field: 'appointmentType', headerName: 'Type', width: 150 },
              { field: 'actions', headerName: 'Actions', width: 200, renderCell: (params) => (
                <div className={classes.centerCell}>
                  <Button variant="contained" color="primary" onClick={() => handleEdit(params.row)}>
                    Edit
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleDelete(params.row._id)}>
                    Delete
                  </Button>
                </div>
              )}
            ]}
            getRowId={(row) => row._id} // Use `_id` as the unique identifier for each row
            autoHeight
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        )}
      </Box>

      {/* Snackbar for success messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />

      {/* Dialog for deleting appointment */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this appointment?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing appointment */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Appointment</DialogTitle>
        <DialogContent>
          <TextField
            label="Date"
            type="date"
            value={editedAppointment.date}
            onChange={(e) => setEditedAppointment({ ...editedAppointment, date: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
          <TextField
            label="Time"
            type="time"
            value={editedAppointment.time}
            onChange={(e) => setEditedAppointment({ ...editedAppointment, time: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
          <TextField
            select
            label="Appointment Type"
            value={editedAppointment.appointmentType}
            onChange={(e) => setEditedAppointment({ ...editedAppointment, appointmentType: e.target.value })}
            fullWidth
            margin="normal"
          >
            <MenuItem value="physical">Physical</MenuItem>
            <MenuItem value="remote">Remote</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">Cancel</Button>
          <Button onClick={handleUpdate} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;

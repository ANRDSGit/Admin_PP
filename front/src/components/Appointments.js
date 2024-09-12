import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Button, TextField, CircularProgress, MenuItem, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    date: '',
    time: '',
    appointmentType: 'physical',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    setLoading(true);
    axios.delete(`http://localhost:5000/appointments/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setAppointments(appointments.filter((apt) => apt._id !== id));
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

  // Separate the appointments into physical and remote types
  const physicalAppointments = appointments.filter((apt) => apt.appointmentType === 'physical');
  const remoteAppointments = appointments.filter((apt) => apt.appointmentType === 'remote');

  return (
    <Box p={2}>
      {/* Title */}
      <Typography variant="h4" gutterBottom textAlign="center">
        Appointments
      </Typography>
      
      {/* Search Box */}
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

      {/* Create Appointment Form */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom textAlign="center">Create New Appointment</Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="Patient Name"
              value={newAppointment.patientName}
              onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
              fullWidth
            />
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

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {/* Display Physical Appointments */}
      <Typography variant="h5" gutterBottom textAlign="center">
        Physical Appointments
      </Typography>
      <Box sx={{ height: { xs: 300, md: 400 }, mb: 4 }}>
        <DataGrid
          rows={physicalAppointments}
          columns={[
            { field: '_id', headerName: 'ID', width: 200 },
            { field: 'patientName', headerName: 'Patient Name', width: 200 },
            { field: 'date', headerName: 'Date', width: 150 },
            { field: 'time', headerName: 'Time', width: 150 },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 150,
              renderCell: (params) => (
                <>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(params.row._id)}
                  >
                    Delete
                  </Button>
                </>
              ),
            },
          ]}
          getRowId={(row) => row._id}
          pageSize={5}
          rowsPerPageOptions={[5]}
          autoHeight
        />
      </Box>

      {/* Display Remote Appointments */}
      <Typography variant="h5" gutterBottom textAlign="center">
        Remote Appointments
      </Typography>
      <Box sx={{ height: { xs: 300, md: 400 } }}>
        <DataGrid
          rows={remoteAppointments}
          columns={[
            { field: '_id', headerName: 'ID', width: 200 },
            { field: 'patientName', headerName: 'Patient Name', width: 150 },
            { field: 'date', headerName: 'Date', width: 150 },
            { field: 'time', headerName: 'Time', width: 100 },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 350,
              renderCell: (params) => (
                <>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(params.row._id)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRedirectRemote(params.row._id)}
                  >
                    Manage Remote
                  </Button>
                </>
              ),
            },
          ]}
          getRowId={(row) => row._id}
          pageSize={5}
          rowsPerPageOptions={[5]}
          autoHeight
        />
      </Box>
    </Box>
  );
};

export default Appointments;

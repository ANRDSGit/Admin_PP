import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, TextField, CircularProgress, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [newMedication, setNewMedication] = useState({
    name: '',
    price: '',
    quantity: '',
    imageUrl: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState(''); // Medical Notepad state
  const token = localStorage.getItem('token'); // Retrieve token from localStorage or other secure storage
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  // Fetch notes from localStorage when component mounts
  useEffect(() => {
    const savedNotes = localStorage.getItem('medicalNotes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Save notes to localStorage
  const handleSaveNotes = () => {
    localStorage.setItem('medicalNotes', notes);
    alert('Notes saved!');
  };

  // Fetch all medications
  useEffect(() => {
    setLoading(true);
    axios.get(`${apiBaseUrl}/medications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setMedications(res.data);
    })
    .catch((err) => {
      setError('Error fetching medications');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [token]);

  // Search medications and populate form and table
  const handleSearch = () => {
    setLoading(true);
    axios.get(`${apiBaseUrl}/medications/search/${searchTerm}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      if (res.data.length > 0) {
        const foundMedication = res.data[0]; // Assuming first result is used
        setNewMedication({
          name: foundMedication.name,
          price: foundMedication.price,
          quantity: foundMedication.quantity,
          imageUrl: foundMedication.imageUrl,
        });
        setMedications([foundMedication]); // Update table to show only the searched result
      } else {
        setError('No medications found');
      }
    })
    .catch((err) => {
      setError('Error searching medications');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Create new medication
  const handleCreate = () => {
    setLoading(true);
    axios.post(`${apiBaseUrl}/medications`, newMedication, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setMedications([...medications, res.data]);
      setNewMedication({ name: '', price: '', quantity: '', imageUrl: '' });
    })
    .catch((err) => {
      setError('Error creating medication');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Delete medication
  const handleDelete = (id) => {
    setLoading(true);
    axios.delete(`${apiBaseUrl}/medications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setMedications(medications.filter((m) => m._id !== id));
    })
    .catch((err) => {
      setError('Error deleting medication');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Update medication
  const handleUpdate = (id) => {
    setLoading(true);
    axios.put(`${apiBaseUrl}/medications/${id}`, newMedication, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setMedications(
        medications.map((medication) =>
          medication._id === id ? res.data : medication
        )
      );
      setNewMedication({ name: '', price: '', quantity: '', imageUrl: '' });
    })
    .catch((err) => {
      setError('Error updating medication');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <Box p={2} sx={{ maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Typography variant="h4" mb={2} align="center">Medications Dashboard</Typography>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Typography color="error" mb={2}>{error}</Typography>
        </motion.div>
      )}

      {/* Loading indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      )}

      {/* Search bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
              <TextField
                label="Search by Medication Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSearch}
                sx={{ height: '100%' }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>
      </motion.div>

      {/* Form to add or update medication */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Medication Name"
                value={newMedication.name}
                onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Price"
                type="number"
                value={newMedication.price}
                onChange={(e) => setNewMedication({ ...newMedication, price: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Quantity"
                type="number"
                value={newMedication.quantity}
                onChange={(e) => setNewMedication({ ...newMedication, quantity: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Image URL"
                value={newMedication.imageUrl}
                onChange={(e) => setNewMedication({ ...newMedication, imageUrl: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleCreate}
                >
                  Add Medication
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </motion.div>

      {/* Medications table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Box height={400} mb={3}>
          <DataGrid
            rows={medications.map((medication) => ({
              ...medication,
              id: medication._id,
            }))}
            columns={[
              { field: 'name', headerName: 'Name', width: 150 },
              { field: 'price', headerName: 'Price', width: 100 },
              { field: 'quantity', headerName: 'Quantity', width: 100 },
              {
                field: 'imageUrl',
                headerName: 'Image',
                width: 150,
                renderCell: (params) => (
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <img src={params.value} alt={params.row.name} style={{ height: 50 }} />
                  </motion.div>
                ),
              },
              {
                field: 'actions',
                headerName: 'Actions',
                width: 250,
                renderCell: (params) => (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdate(params.row.id)}
                        style={{ marginRight: '10px' }}
                      >
                        Update
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDelete(params.row.id)}
                      >
                        Delete
                      </Button>
                    </motion.div>
                  </>
                ),
              },
            ]}
            pageSize={5}
          />
        </Box>
      </motion.div>

      {/* Medical Notepad */}
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Typography variant="h5" mb={2}>Medical Notepad</Typography>
        <TextField
          label="Notes"
          multiline
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveNotes}
          sx={{ marginTop: '10px' }}
        >
          Save Notes
        </Button>
      </motion.div>
    </Box>
  );
};

export default Medications;

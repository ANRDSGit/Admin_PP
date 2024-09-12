import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Button, TextField, CircularProgress } from '@mui/material';

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
  const token = localStorage.getItem('token'); // Retrieve token from localStorage or other secure storage

  // Fetch all medications
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/medications', {
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

  // Create new medication
  const handleCreate = () => {
    setLoading(true);
    axios.post('http://localhost:5000/medications', newMedication, {
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

  // Search medications
  const handleSearch = () => {
    setLoading(true);
    axios.get(`http://localhost:5000/medications/search/${searchTerm}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setMedications(res.data);
    })
    .catch((err) => {
      setError('Error searching medications');
      console.error(err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Delete medication
  const handleDelete = (id) => {
    setLoading(true);
    axios.delete(`http://localhost:5000/medications/${id}`, {
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
    axios.put(`http://localhost:5000/medications/${id}`, newMedication, {
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
    <Box display="flex" flexDirection="column" p={2}>
      <Typography variant="h4" mb={2}>Medications Dashboard</Typography>

      {/* Error message */}
      {error && <Typography color="error" mb={2}>{error}</Typography>}

      {/* Loading indicator */}
      {loading && <CircularProgress />}

      {/* Search bar */}
      <Box display="flex" mb={2}>
        <TextField
          label="Search by Medication Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Form to add new medication */}
      <Box display="flex" mb={2}>
        <TextField
          label="Medication Name"
          value={newMedication.name}
          onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
          fullWidth
        />
        <TextField
          label="Price"
          type="number"
          value={newMedication.price}
          onChange={(e) => setNewMedication({ ...newMedication, price: e.target.value })}
          fullWidth
        />
        <TextField
          label="Quantity"
          type="number"
          value={newMedication.quantity}
          onChange={(e) => setNewMedication({ ...newMedication, quantity: e.target.value })}
          fullWidth
        />
        <TextField
          label="Image URL"
          value={newMedication.imageUrl}
          onChange={(e) => setNewMedication({ ...newMedication, imageUrl: e.target.value })}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Add Medication
        </Button>
      </Box>

      {/* Medications table */}
      <Box height={400}>
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
                <img src={params.value} alt={params.row.name} style={{ height: 50 }} />
              ),
            },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 250,
              renderCell: (params) => (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpdate(params.row.id)}
                    style={{ marginRight: '10px' }}
                  >
                    Update
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(params.row.id)}
                  >
                    Delete
                  </Button>
                </>
              ),
            },
          ]}
          pageSize={5}
        />
      </Box>
    </Box>
  );
};

export default Medications;

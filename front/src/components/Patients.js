import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Grid,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    email: "",
    password: "",
  }); // Added email field
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogOpen2, setConfirmDialogOpen2] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [patientFinger, setPatientFinger] = useState(null);
  const token = localStorage.getItem("token");
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${apiBaseUrl}/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPatients(res.data);
      })
      .catch((err) => {
        setError("Error fetching patients");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // Create new patient
  const handleCreate = () => {
    setLoading(true);
    axios
      .post(
        `${apiBaseUrl}/patients`,
        {
          name: newPatient.name,
          age: Number(newPatient.age),
          gender: newPatient.gender,
          bloodGroup: newPatient.bloodGroup,
          email: newPatient.email, // Include email in the payload
          number: newPatient.number, // Include number in the payload
          password: newPatient.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setPatients([...patients, res.data.patient]);
        // Reset form
        setNewPatient({
          name: "",
          age: "",
          gender: "",
          bloodGroup: "",
          number: "",
          email: "",
          password: "",
        });
      })
      .catch((err) => {
        setError("Error creating patient");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Search patients
  const handleSearch = () => {
    setLoading(true);
    axios
      .get(`${apiBaseUrl}/patients/search/${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPatients(res.data);
      })
      .catch((err) => {
        setError("Error searching patients");
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

  // Add Fingerprint
  const handleAddFinger = (id) => {
    setPatientFinger(id);
    setIsAdded(false);

    const fingerPrintId = id.split("U00")[1];
    const fingerprintCount = parseInt(fingerPrintId, 10);

    // Payload
    const payload = {
      DeviceMode: "signup",
      FingerPrintCount: fingerprintCount,
      GetUser: id,
    };

    axios
      .post(`${apiBaseUrl}/addFingerprintData`, payload)
      .then((res) => {
        console.log(res.data);
        setConfirmDialogOpen2(true); // Open the modal

        // Start checking if DeviceMode is "auth" after modal opens
        const interval = setInterval(async () => {
          try {
            const response = await axios.get(`${apiBaseUrl}/checkDeviceMode`);
            if (response.data.status === true) {
              // setConfirmDialogOpen2(false);
              setIsAdded(true);
              clearInterval(interval);
            }
          } catch (error) {
            console.error("Error checking device mode:", error);
          }
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Delete patient after confirmation
  const handleDelete = () => {
    setLoading(true);
    axios
      .delete(`${apiBaseUrl}/patients/${patientToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setPatients(patients.filter((p) => p._id !== patientToDelete)); // Remove patient from list
        setConfirmDialogOpen(false); // Close the dialog after deletion
      })
      .catch((err) => {
        setError("Error deleting patient");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Update patient's age
  const handleAgeUpdate = (id, age) => {
    setLoading(true);
    axios
      .put(
        `${apiBaseUrl}/patients/${id}`,
        { age: Number(age) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setPatients(patients.map((p) => (p._id === id ? res.data : p)));
        setEditingPatient(null); // Reset after updating
      })
      .catch((err) => {
        setError("Error updating patient age");
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

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {loading && <CircularProgress />}

      {/* Search bar */}
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ mb: 2 }}
      >
        <Grid item xs={12} md={8}>
          <TextField
            label="Search Patients"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            fullWidth
          >
            Search
          </Button>
        </Grid>
      </Grid>

      {/* Form to add new patient */}
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom textAlign="center">
          Add New Patient
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Name"
              value={newPatient.name}
              onChange={(e) =>
                setNewPatient({ ...newPatient, name: e.target.value })
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Age"
              type="number"
              value={newPatient.age}
              onChange={(e) =>
                setNewPatient({ ...newPatient, age: e.target.value })
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={newPatient.gender}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, gender: e.target.value })
                }
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
                onChange={(e) =>
                  setNewPatient({ ...newPatient, bloodGroup: e.target.value })
                }
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
          <Grid item xs={12} md={4}>
            <TextField
              label="Email"
              type="email"
              value={newPatient.email}
              onChange={(e) =>
                setNewPatient({ ...newPatient, email: e.target.value })
              }
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Number"
              type="number"
              value={newPatient.number}
              onChange={(e) =>
                setNewPatient({ ...newPatient, number: e.target.value })
              }
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="Password"
              type="password"
              value={newPatient.password}
              onChange={(e) =>
                setNewPatient({ ...newPatient, password: e.target.value })
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreate}
              fullWidth
            >
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
              { field: "name", headerName: "Patient Name", width: 150 },
              {
                field: "age",
                headerName: "Age",
                width: 100,
                renderCell: (params) => {
                  const isEditing = editingPatient === params.row.id;
                  return isEditing ? (
                    <TextField
                      type="number"
                      value={params.row.age}
                      onChange={(e) =>
                        setPatients(
                          patients.map((p) =>
                            p._id === params.row.id
                              ? { ...p, age: e.target.value }
                              : p
                          )
                        )
                      }
                      onBlur={() =>
                        handleAgeUpdate(params.row.id, params.row.age)
                      }
                      fullWidth
                    />
                  ) : (
                    <span onClick={() => setEditingPatient(params.row.id)}>
                      {params.value}
                    </span>
                  );
                },
              },
              { field: "gender", headerName: "Gender", width: 100 },
              { field: "bloodGroup", headerName: "Blood Group", width: 100 },
              { field: "email", headerName: "Email", width: 150 }, // Added email field in table
              { field: "number", headerName: "Number", width: 150 },
              {
                field: "delete",
                headerName: "Actions",
                width: 150,
                renderCell: (params) => (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteConfirmation(params.row.id)}
                  >
                    Delete
                  </Button>
                ),
              },
              {
                field: "Fingerprint",
                headerName: "Add Finger",
                width: 150,
                renderCell: (params) => (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      handleAddFinger(params.row.userId);
                    }}
                  >
                    Add Finger
                  </Button>
                ),
              },
            ]}
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Delete Patient</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this patient?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialogOpen2}
        onClose={() => setConfirmDialogOpen2(false)}
      >
        <DialogTitle>Add Fingerprint</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please place your finger on the fingerprint scanner to proceed with
            the enrollment.
          </DialogContentText>
          <img
            src="https://img.freepik.com/free-vector/fingerprint-concept-illustration_114360-3021.jpg?t=st=1729112904~exp=1729116504~hmac=bcca9675dafe916c816646555a8dea2e431b8449d3492548f7a8765b9c0d9715&w=900"
            alt="Fingerprint Scanner"
            style={{
              width: "300px",
              height: "300px",
              margin: "20px auto",
              display: "block",
            }}
          />
          {isAdded ? (
            <DialogContentText>
            successfully Added..!
          </DialogContentText>
          ):(
            <DialogContentText>
            Processing... Please wait
          </DialogContentText>
          )}
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen2(false)}>Cancel</Button>
          <Button color="primary" onClick={() => setConfirmDialogOpen2(false)} disabled={!isAdded}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default App;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Typography, Box, Button, List, ListItem, ListItemText } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2'; // Import Bar and Pie charts
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend } from 'chart.js';

// Register necessary chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend);

const Home = () => {
  const navigate = useNavigate();
  // Sample data for the Bar chart
  const appointmentData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Appointments per Day',
        data: [12, 19, 8, 10, 15, 9, 7],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Sample data for the Pie chart
  const patientGenderData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        data: [50, 40, 10],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      },
    ],
  };

  // Sample data for Today's Appointments
  const todaysAppointments = [
    { id: 1, patient: 'John Doe', time: '09:00 AM', doctor: 'Dr. Smith', age: 45, type: 'Check-up', notes: 'Follow-up required' },
    { id: 2, patient: 'Jane Doe', time: '10:30 AM', doctor: 'Dr. Jones', age: 30, type: 'Dental', notes: 'Root canal scheduled' },
    { id: 3, patient: 'Alice Johnson', time: '01:00 PM', doctor: 'Dr. Brown', age: 27, type: 'Consultation', notes: 'First visit' },
    { id: 4, patient: 'Bob Brown', time: '02:30 PM', doctor: 'Dr. Green', age: 52, type: 'Surgery Consultation', notes: 'Discuss options' },
  ];

  return (
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      

      <Grid container spacing={3}>
        {/* Patients Overview Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ padding: '1rem', textAlign: 'center' }}>
            <Typography variant="h6">Patients</Typography>
            <Typography variant="h4" color="primary">120</Typography>
            <Button variant="contained" component={Link} to="/patients" sx={{ marginTop: '1rem' }}>
              View Patients
            </Button>
          </Paper>
        </Grid>

        {/* Appointments Overview Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ padding: '1rem', textAlign: 'center' }}>
            <Typography variant="h6">Appointments</Typography>
            <Typography variant="h4" color="primary">35</Typography>
            <Button variant="contained" component={Link} to="/appointments" sx={{ marginTop: '1rem' }}>
              View Appointments
            </Button>
          </Paper>
        </Grid>

        {/* Medications Overview Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ padding: '1rem', textAlign: 'center' }}>
            <Typography variant="h6">Medications</Typography>
            <Typography variant="h4" color="primary">15</Typography>
            <Button variant="contained" component={Link} to="/medications" sx={{ marginTop: '1rem' }}>
              View Medications
            </Button>
          </Paper>
        </Grid>

        {/* Bar Chart for Appointments */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: '1rem' }}>
            <Typography variant="h6">Appointments per Day</Typography>
            <Bar data={appointmentData} options={{ responsive: true }} />
          </Paper>
        </Grid>

        {/* Pie Chart for Patient Genders */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: '1rem' }}>
            <Typography variant="h6">Patient Gender Distribution</Typography>
            <Pie data={patientGenderData} options={{ responsive: true }} />
          </Paper>
        </Grid>

        {/* Today's Appointments */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: '1rem' }}>
            <Typography variant="h6" gutterBottom>
              Today's Appointments
            </Typography>
            <List>
              {todaysAppointments.map((appointment) => (
                <ListItem key={appointment.id}>
                  <ListItemText 
                    primary={`${appointment.patient} (Age: ${appointment.age})`} 
                    secondary={`Time: ${appointment.time}, Doctor: ${appointment.doctor}, Type: ${appointment.type}, Notes: ${appointment.notes}`} 
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Medical Center Details */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: '1rem' }}>
            <Typography variant="h6" gutterBottom>
              About the Medical Center
            </Typography>
            <Typography variant="body1" gutterBottom>
            At our Ayurvedic Medical Center, we focus on holistic health using time-tested, natural healing methods rooted in the principles of Ayurveda. Our expert team of practitioners is dedicated to providing personalized care that brings balance to your body, mind, and soul. Whether you are looking to manage stress, improve your overall well-being, or treat a specific condition, we are here to help you achieve optimal health.
            </Typography>
            <Typography variant="body2">
              Address: 123 Medical Street, Healthcare City
            </Typography>
            <Typography variant="body2">
              Contact: +123-456-7890 | Email: info@medicalcenter.com
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;

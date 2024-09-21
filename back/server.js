const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "secret";

const app = express();

app.use(cors());
app.use(bodyParser.json());

const corsOptions = {
  origin: '*',  // Allow only your frontend's origin
  credentials: true,            // Allow cookies
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect('mongodb+srv://anrds:1234@cluster0.iowtq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

// Define Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Admin = mongoose.model('Admin', adminSchema);

// Create a default admin user
async function createDefaultAdmin() {
  const adminExists = await Admin.findOne({ username: 'admin' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({ username: 'admin', password: hashedPassword });
    await admin.save();
    console.log('Default admin created: admin/admin123');
  }
}

createDefaultAdmin();

// Admin login route
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });

  if (!admin) {
    return res.status(400).send({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(400).send({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin._id }, SECRET_KEY, { expiresIn: '1h' });
  res.send({ token });
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).send({ message: 'Invalid token' });
  }
}

// Define Patient Schema
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Patient = mongoose.model('Patient', patientSchema);

// Routes for CRUD operations (protected)
app.post('/patients', authenticateToken, async (req, res) => {
  try {
    const { name, age, gender, bloodGroup, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newPatient = new Patient({
      name,
      age,
      gender,
      bloodGroup,
      password: hashedPassword,
    });
    await newPatient.save();
    res.status(201).json({ message: 'Patient registered successfully', patient: newPatient });
  } catch (error) {
    res.status(500).json({ error: 'Error registering patient' });
  }
});

app.get('/patients', authenticateToken, async (req, res) => {
  const patients = await Patient.find();
  res.send(patients);
});

app.get('/patients/search/:name', authenticateToken, async (req, res) => {
  const patients = await Patient.find({ name: new RegExp(req.params.name, 'i') });
  res.send(patients);
});

app.put('/patients/:id', authenticateToken, async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(patient);
});

app.delete('/patients/:id', authenticateToken, async (req, res) => {
  await Patient.findByIdAndDelete(req.params.id);
  res.send({ message: 'Patient deleted' });
});

// Define Appointment Schema
const appointmentSchema = new mongoose.Schema({
  patientName: String,
  date: Date,
  time: String,
  appointmentType: { type: String, enum: ['physical', 'remote'], required: true },  
  remoteLink: String,  // Add field to store remote appointment link
  createdAt: { type: Date, default: Date.now },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Create appointment route
app.post('/appointments', authenticateToken, async (req, res) => {
  const { patientName, date, time, appointmentType } = req.body;

  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) {
    return res.status(400).send({ message: 'Invalid date format' });
  }

  if (!['physical', 'remote'].includes(appointmentType)) {
    return res.status(400).send({ message: 'Invalid appointment type' });
  }

  const appointment = new Appointment({
    patientName,
    date: parsedDate,
    time,
    appointmentType,
  });

  await appointment.save();
  res.send(appointment);
});

// Update remote appointment link
app.put('/appointments/:id/link', authenticateToken, async (req, res) => {
  const { remoteLink } = req.body;

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { remoteLink },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).send({ message: 'Appointment not found' });
    }

    res.send(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Error updating appointment link' });
  }
});

app.get('/appointments', authenticateToken, async (req, res) => {
  const appointments = await Appointment.find();
  res.send(appointments);
});

app.get('/appointments/search/:patientName', authenticateToken, async (req, res) => {
  const appointments = await Appointment.find({
    patientName: new RegExp(req.params.patientName, 'i'),
  });
  res.send(appointments);
});

// Delete appointment
app.delete('/appointments/:id', authenticateToken, async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.send({ message: 'Appointment deleted' });
});

// Define Medication Schema
const medicationSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const Medication = mongoose.model('Medication', medicationSchema);

// Routes for CRUD operations on medications (protected)
app.post('/medications', authenticateToken, async (req, res) => {
  const medication = new Medication(req.body);
  await medication.save();
  res.send(medication);
});

app.get('/medications', authenticateToken, async (req, res) => {
  const medications = await Medication.find();
  res.send(medications);
});

app.get('/medications/search/:name', authenticateToken, async (req, res) => {
  const medications = await Medication.find({
    name: new RegExp(req.params.name, 'i'),
  });
  res.send(medications);
});

app.put('/medications/:id', authenticateToken, async (req, res) => {
  const medication = await Medication.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(medication);
});

app.delete('/medications/:id', authenticateToken, async (req, res) => {
  await Medication.findByIdAndDelete(req.params.id);
  res.send({ message: 'Medication deleted' });
});

// Start the server
app.listen(5000, () => {
  console.log('Backend running on port 5000');
});

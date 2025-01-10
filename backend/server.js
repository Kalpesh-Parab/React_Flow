require('dotenv').config(); // Load .env file

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Agenda = require('agenda');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Initialize Agenda for Job Scheduling
const agenda = new Agenda({
  db: {
    address: process.env.AGENDA_DB_URI,
  },
});

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Define the Agenda Job for Sending Emails
agenda.define('send email', async (job) => {
  const { to, subject, text } = job.attrs.data;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
  console.log(`✅ Email Sent to ${to}`);
});

// Start Agenda
agenda.start();

// API Endpoint to Schedule Emails
app.post('/api/scheduleEmail', async (req, res) => {
  try {
    const { to, subject, text, delay } = req.body;
    await agenda.schedule(delay, 'send email', { to, subject, text });
    res.status(201).send('✅ Email Scheduled Successfully');
  } catch (error) {
    console.error('❌ Error Scheduling Email:', error);
    res.status(500).send('Error Scheduling Email');
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);

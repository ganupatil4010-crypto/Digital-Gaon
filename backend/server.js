require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Start Server First (Important for Mocking)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`--- BACKEND IS LIVE ---`);
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`To see real OTP, check your Gmail after configuring .env`);
});

// MongoDB Connection (Attempt in background)
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
        console.log('--- MONGODB CONNECTED ---');
    })
    .catch(err => {
        console.log('--- DATABASE NOTICE ---');
        console.log('MongoDB not found. Proceeding in MOCK DB MODE (In-memory).');
    });



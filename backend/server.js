require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database'); // Initialize SQLite
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`--- BACKEND IS LIVE ---`);
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`Database: SQLite (file-based, no server needed)`);
});

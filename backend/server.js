require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User'); // If needed for cleanup
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Cloud Database
connectDB();

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'https://digital-gaon.vercel.app',
    /\.vercel\.app$/,
    /\.netlify\.app$/
];
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
            return callback(null, true);
        }
        return callback(null, true); // Allow all for now — tighten in production if needed
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`--- BACKEND IS LIVE ---`);
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`Database: MongoDB (Atlas)`);
    
    // Start the cleanup job on startup and then run every hour
    startCleanupJob();
});

// Background Cleanup Job: Remove products older than 24 hours
async function startCleanupJob() {
    const runCleanup = async () => {
        try {
            console.log('--- RUNNING CLEANUP JOB (MongoDB) ---');
            
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            // Delete products older than 24 hours
            const result = await Product.deleteMany({
                createdAt: { $lt: twentyFourHoursAgo }
            });
            
            if (result.deletedCount > 0) {
                console.log(`Cleaned up ${result.deletedCount} expired products.`);
            } else {
                console.log('No expired products to clean up.');
            }
        } catch (error) {
            console.error('Cleanup Job Error:', error);
        }
    };

    // Run immediately on startup
    runCleanup();
    
    // Then run every hour
    setInterval(runCleanup, 3600000); 
}

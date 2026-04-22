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
const adRoutes = require('./routes/adRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Senior Fix: Priority Middlewares (Parser first)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Senior Diagnostics: Global Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] INCOMING: ${req.method} ${req.path}`);
    next();
});

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

// Diagnostics Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is reachable', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ads', adRoutes); // Keep this for public GET /active, but adminRoutes will handle the rest via nesting

// Senior Diagnostics: Global Error Handler
app.use((err, req, res, next) => {
    console.error('--- GLOBAL ERROR CAUGHT ---');
    console.error('Path:', req.path);
    console.error('Method:', req.method);
    console.error('Message:', err.message);
    if (err.type === 'entity.too.large') {
        console.error('REASON: Payload size exceeds limit!');
    }
    res.status(err.status || 500).json({ error: err.message || 'Server Internal Error' });
});

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
            
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            // Delete products older than 7 days
            const result = await Product.deleteMany({
                createdAt: { $lt: sevenDaysAgo }
            });
            
            if (result.deletedCount > 0) {
                console.log(`Cleaned up ${result.deletedCount} expired products (older than 7 days).`);
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

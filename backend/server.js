require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database'); // Initialize SQLite
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
    console.log(`Database: SQLite (file-based, no server needed)`);
    
    // Start the cleanup job on startup and then run every hour
    startCleanupJob();
});

// Background Cleanup Job: Remove products older than 24 hours
function startCleanupJob() {
    const runCleanup = () => {
        try {
            console.log('--- RUNNING CLEANUP JOB ---');
            
            // 1. Delete products older than 24 hours
            const deleteExpiredProducts = db.prepare(`
                DELETE FROM products 
                WHERE createdAt < datetime('now', '-1 day')
            `);
            const result = deleteExpiredProducts.run();
            
            if (result.changes > 0) {
                console.log(`Cleaned up ${result.changes} expired products.`);
                
                // 2. Clean up orphaned wishlist items (where product no longer exists)
                const cleanupWishlist = db.prepare(`
                    DELETE FROM wishlist 
                    WHERE productId NOT IN (SELECT id FROM products)
                `);
                const wishlistResult = cleanupWishlist.run();
                if (wishlistResult.changes > 0) {
                    console.log(`Cleaned up ${wishlistResult.changes} orphaned wishlist items.`);
                }
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

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User'); // If needed for cleanup
const Expense = require('./models/Expense');
const StudyEntry = require('./models/StudyEntry');
const VyaparSale = require('./models/VyaparSale');
const VyaparUdhaar = require('./models/VyaparUdhaar');
const DairyEntry = require('./models/DairyEntry');
const DairyCustomer = require('./models/DairyCustomer');
const PashuTreatment = require('./models/PashuTreatment');
const PashuUdhaar = require('./models/PashuUdhaar');
const DairyUdhaar = require('./models/DairyUdhaar');
const YatraBooking = require('./models/YatraBooking');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adRoutes = require('./routes/adRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const studyRoutes = require('./routes/studyRoutes');
const vyaparRoutes = require('./routes/vyaparRoutes');
const dairyRoutes = require('./routes/dairyRoutes');
const accessRoutes = require('./routes/accessRoutes');
const pashuRoutes = require('./routes/pashuRoutes');
const yatraRoutes = require('./routes/yatraRoutes');

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
app.use('/api/ads', adRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/vyapar', vyaparRoutes);
app.use('/api/dairy', dairyRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/pashu', pashuRoutes);
app.use('/api/yatra', yatraRoutes);

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
            
            // Delete Khata expenses older than 30 days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const expenseResult = await Expense.deleteMany({
                createdAt: { $lt: thirtyDaysAgo }
            });
            
            if (expenseResult.deletedCount > 0) {
                console.log(`Cleaned up ${expenseResult.deletedCount} old khata entries (older than 30 days).`);
            }

            // Delete Study entries older than 90 days (keeps ~3 months of streak history)
            const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            const studyResult = await StudyEntry.deleteMany({
                date: { $lt: ninetyDaysAgo }
            });
            if (studyResult.deletedCount > 0) {
                console.log(`Cleaned up ${studyResult.deletedCount} old study entries (older than 90 days).`);
            }

            // Delete Vyapar Sale entries older than 30 days
            const vyaparSaleResult = await VyaparSale.deleteMany({
                date: { $lt: thirtyDaysAgo }
            });
            if (vyaparSaleResult.deletedCount > 0) {
                console.log(`Cleaned up ${vyaparSaleResult.deletedCount} old vyapar sale entries (older than 30 days).`);
            }

            // Delete settled Vyapar Udhaar entries older than 30 days
            const vyaparUdhaarResult = await VyaparUdhaar.deleteMany({
                date: { $lt: thirtyDaysAgo }
            });
            if (vyaparUdhaarResult.deletedCount > 0) {
                console.log(`Cleaned up ${vyaparUdhaarResult.deletedCount} old udhaar entries (older than 30 days).`);
            }

            // Delete Dairy entries older than 30 days
            const dairyResult = await DairyEntry.deleteMany({
                date: { $lt: thirtyDaysAgo }
            });
            if (dairyResult.deletedCount > 0) {
                console.log(`Cleaned up ${dairyResult.deletedCount} old dairy entries (older than 30 days).`);
            }

            // Delete Pashu Treatment records older than 30 days
            const pashuResult = await PashuTreatment.deleteMany({
                date: { $lt: thirtyDaysAgo },
                nextDueDate: { $exists: false } // keep vaccination reminders
            });
            if (pashuResult.deletedCount > 0) {
                console.log(`Cleaned up ${pashuResult.deletedCount} old pashu treatment records.`);
            }

            // Delete Dairy Udhaar older than 30 days
            const dairyUdhaarResult = await DairyUdhaar.deleteMany({
                date: { $lt: thirtyDaysAgo }
            });
            if (dairyUdhaarResult.deletedCount > 0) {
                console.log(`Cleaned up ${dairyUdhaarResult.deletedCount} old dairy udhaar entries.`);
            }

            // Delete Pashu Udhaar older than 30 days
            const pashuUdhaarResult = await PashuUdhaar.deleteMany({
                date: { $lt: thirtyDaysAgo }
            });
            if (pashuUdhaarResult.deletedCount > 0) {
                console.log(`Cleaned up ${pashuUdhaarResult.deletedCount} old pashu udhaar entries.`);
            }
            
            // Delete Yatra Booking entries older than 30 days
            const yatraResult = await YatraBooking.deleteMany({
                tripDate: { $lt: thirtyDaysAgo }
            });
            if (yatraResult.deletedCount > 0) {
                console.log(`Cleaned up ${yatraResult.deletedCount} old yatra bookings (older than 30 days).`);
            }

            // Clean orphaned wishlist IDs (product was deleted but ID still in wishlist)
            const allProductIds = await Product.find({}, '_id').lean();
            const validIds = new Set(allProductIds.map(p => p._id.toString()));
            const usersWithWishlists = await User.find({ wishlist: { $exists: true, $ne: [] } }, 'wishlist').lean();
            let wishlistCleaned = 0;
            for (const u of usersWithWishlists) {
                const cleanedList = u.wishlist.filter(id => validIds.has(id.toString()));
                if (cleanedList.length !== u.wishlist.length) {
                    await User.findByIdAndUpdate(u._id, { wishlist: cleanedList });
                    wishlistCleaned += (u.wishlist.length - cleanedList.length);
                }
            }
            if (wishlistCleaned > 0) {
                console.log(`Cleaned ${wishlistCleaned} orphaned wishlist entries.`);
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

const express = require('express');
const router = express.Router();
const User = require('../models/User');

const FEATURES = ['vyapar', 'dairy', 'pashu', 'yatra'];
const getField = (f) => f + 'Access';

// User requests access
router.post('/request', async (req, res) => {
    try {
        const { email, feature } = req.body;
        const cleanFeature = feature ? feature.trim().toLowerCase() : '';
        const cleanEmail = email ? email.trim() : '';
        
        console.log(`[DEBUG] Access Request: "${cleanEmail}" for "${cleanFeature}"`);
        console.log('[DEBUG] Available Features:', FEATURES);

        if (!cleanEmail || !FEATURES.includes(cleanFeature)) {
            console.log(`[DEBUG] Request Rejected: Invalid Feature "${cleanFeature}" or missing email`);
            return res.status(400).json({ error: 'Invalid request' });
        }
        
        const field = getField(cleanFeature);
        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            console.log(`[DEBUG] Request Rejected: User "${cleanEmail}" not found in database`);
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user[field] === 'approved') return res.json({ status: 'approved' });
        if (user[field] === 'pending') return res.json({ status: 'pending' });
        
        user[field] = 'pending';
        await user.save();
        console.log(`[DEBUG] Request Successful: Set ${field} to pending for ${cleanEmail}`);
        res.json({ status: 'pending', message: 'Request sent to admin!' });
    } catch (err) { 
        console.error('[DEBUG] Access Request CRITICAL Error:', err);
        res.status(500).json({ error: 'Server error' }); 
    }
});

// Get access status for a user
router.get('/status', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });
        const user = await User.findOne({ email }).select('vyaparAccess dairyAccess pashuAccess yatraAccess');
        if (!user) return res.json({ vyaparAccess: 'none', dairyAccess: 'none', pashuAccess: 'none', yatraAccess: 'none' });
        res.json({ 
            vyaparAccess: user.vyaparAccess || 'none', 
            dairyAccess: user.dairyAccess || 'none', 
            pashuAccess: user.pashuAccess || 'none',
            yatraAccess: user.yatraAccess || 'none'
        });
    } catch { res.status(500).json({ error: 'Server error' }); }
});

// Admin: get all pending requests
router.get('/pending', async (req, res) => {
    try {
        const [vyapar, dairy, pashu, yatra] = await Promise.all([
            User.find({ vyaparAccess: 'pending' }).select('email name village createdAt'),
            User.find({ dairyAccess: 'pending' }).select('email name village createdAt'),
            User.find({ pashuAccess: 'pending' }).select('email name village createdAt'),
            User.find({ yatraAccess: 'pending' }).select('email name village createdAt'),
        ]);
        res.json({ vyapar, dairy, pashu, yatra });
    } catch { res.status(500).json({ error: 'Server error' }); }
});

// Admin: get all approved users
router.get('/approved', async (req, res) => {
    try {
        const [vyapar, dairy, pashu, yatra] = await Promise.all([
            User.find({ vyaparAccess: 'approved' }).select('email name village createdAt'),
            User.find({ dairyAccess: 'approved' }).select('email name village createdAt'),
            User.find({ pashuAccess: 'approved' }).select('email name village createdAt'),
            User.find({ yatraAccess: 'approved' }).select('email name village createdAt'),
        ]);
        res.json({ vyapar, dairy, pashu, yatra });
    } catch { res.status(500).json({ error: 'Server error' }); }
});

// Admin: approve or reject
router.put('/manage', async (req, res) => {
    try {
        const { userId, feature, action } = req.body;
        if (!FEATURES.includes(feature) || !['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'Invalid' });
        const field = getField(feature);
        const newStatus = action === 'approve' ? 'approved' : 'none';
        await User.findByIdAndUpdate(userId, { [field]: newStatus });
        res.json({ message: `${feature} access ${action}d` });
    } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;

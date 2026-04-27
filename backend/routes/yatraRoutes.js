const express = require('express');
const router = express.Router();
const YatraBooking = require('../models/YatraBooking');

// Get all bookings for a user
router.get('/bookings', async (req, res) => {
    try {
        const { email } = req.query;
        const bookings = await YatraBooking.find({ userEmail: email }).sort({ tripDate: 1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new booking
router.post('/bookings', async (req, res) => {
    try {
        const newBooking = new YatraBooking(req.body);
        const saved = await newBooking.save();
        res.json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Settle/Complete a booking
router.put('/bookings/:id/complete', async (req, res) => {
    try {
        const updated = await YatraBooking.findByIdAndUpdate(
            req.params.id, 
            { status: 'Completed' }, 
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a booking
router.delete('/bookings/:id', async (req, res) => {
    try {
        await YatraBooking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get stats
router.get('/stats', async (req, res) => {
    try {
        const { email } = req.query;
        const bookings = await YatraBooking.find({ userEmail: email });
        
        const upcomingTrips = bookings.filter(b => b.status === 'Upcoming').length;
        const pendingPayment = bookings
            .filter(b => b.status === 'Upcoming' || b.status === 'Completed')
            .reduce((sum, b) => sum + (b.totalAmount - b.advancePaid), 0);
            
        res.json({ upcomingTrips, pendingPayment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

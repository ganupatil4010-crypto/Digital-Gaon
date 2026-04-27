const express = require('express');
const router = express.Router();
const HotelOrder = require('../models/HotelOrder');
const HotelUdhaar = require('../models/HotelUdhaar');

// ─── ORDERS ───────────────────────────────────────────────

// Get all orders (including past ones for stats)
router.get('/orders', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });
        const orders = await HotelOrder.find({ email }).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new order
router.post('/orders', async (req, res) => {
    try {
        const order = new HotelOrder(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order status (e.g., mark as Paid)
router.patch('/orders/:id', async (req, res) => {
    try {
        const order = await HotelOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete order
router.delete('/orders/:id', async (req, res) => {
    try {
        await HotelOrder.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── UDHAAR KHATA ──────────────────────────────────────────

// Get all udhaar
router.get('/udhaar', async (req, res) => {
    try {
        const { email } = req.query;
        const udhaar = await HotelUdhaar.find({ email, isSettle: false }).sort({ date: -1 });
        res.json(udhaar);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add udhaar
router.post('/udhaar', async (req, res) => {
    try {
        const entry = new HotelUdhaar(req.body);
        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Settle udhaar
router.delete('/udhaar/:id', async (req, res) => {
    try {
        await HotelUdhaar.findByIdAndDelete(req.params.id);
        res.json({ message: 'Settled' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

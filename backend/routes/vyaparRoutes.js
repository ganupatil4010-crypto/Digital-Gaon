const express = require('express');
const router = express.Router();
const VyaparSale = require('../models/VyaparSale');
const VyaparUdhaar = require('../models/VyaparUdhaar');

// ---------- SALES ROUTES ----------

// Get all sales for a user
router.get('/sales', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        const sales = await VyaparSale.find({ email }).sort({ date: -1 });
        res.json(sales);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Record a new sale
router.post('/sales', async (req, res) => {
    try {
        const { email, itemName, amount, quantitySold } = req.body;
        if (!email || !itemName || amount === undefined || quantitySold === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const newSale = new VyaparSale({ email, itemName, amount, quantitySold });
        await newSale.save();
        res.status(201).json(newSale);
    } catch (error) {
        console.error('Error recording sale:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a sale
router.delete('/sales/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await VyaparSale.findByIdAndDelete(id);
        res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ---------- UDHAAR (CUSTOMER DUES) ROUTES ----------

// Get all udhaar entries for a user
router.get('/udhaar', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        const entries = await VyaparUdhaar.find({ email }).sort({ date: -1 });
        res.json(entries);
    } catch (error) {
        console.error('Error fetching udhaar:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add a new udhaar entry
router.post('/udhaar', async (req, res) => {
    try {
        const { email, customerName, phoneNumber, amount } = req.body;
        if (!email || !customerName || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const newEntry = new VyaparUdhaar({ email, customerName, phoneNumber, amount });
        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        console.error('Error adding udhaar:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete an udhaar entry (when customer pays back)
router.delete('/udhaar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await VyaparUdhaar.findByIdAndDelete(id);
        res.json({ message: 'Udhaar settled successfully' });
    } catch (error) {
        console.error('Error settling udhaar:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

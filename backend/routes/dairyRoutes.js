const express = require('express');
const router = express.Router();
const DairyCustomer = require('../models/DairyCustomer');
const DairyEntry = require('../models/DairyEntry');

// ─── CUSTOMERS ────────────────────────────────────────────────

// Get all customers
router.get('/customers', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });
        const customers = await DairyCustomer.find({ email, isActive: true }).sort({ customerName: 1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new customer
router.post('/customers', async (req, res) => {
    try {
        const { email, customerName, phoneNumber, morningQty, eveningQty, ratePerLitre } = req.body;
        if (!email || !customerName || !ratePerLitre) return res.status(400).json({ error: 'Missing fields' });
        const customer = new DairyCustomer({ email, customerName, phoneNumber, morningQty, eveningQty, ratePerLitre });
        await customer.save();
        res.status(201).json(customer);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete customer
router.delete('/customers/:id', async (req, res) => {
    try {
        await DairyCustomer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── DAILY ENTRIES ────────────────────────────────────────────

// Get entries (optionally filter by date range)
router.get('/entries', async (req, res) => {
    try {
        const { email, from, to } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });
        const filter = { email };
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }
        const entries = await DairyEntry.find(filter).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add daily entry for a customer
router.post('/entries', async (req, res) => {
    try {
        const { email, customerId, customerName, date, morningQty, eveningQty, ratePerLitre } = req.body;
        if (!email || !customerName || ratePerLitre === undefined) return res.status(400).json({ error: 'Missing fields' });
        const totalLitres = (parseFloat(morningQty) || 0) + (parseFloat(eveningQty) || 0);
        const totalAmount = totalLitres * parseFloat(ratePerLitre);
        const entry = new DairyEntry({ email, customerId, customerName, date, morningQty, eveningQty, ratePerLitre, totalLitres, totalAmount });
        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark entry as paid
router.put('/entries/:id/pay', async (req, res) => {
    try {
        const entry = await DairyEntry.findByIdAndUpdate(req.params.id, { isPaid: true }, { new: true });
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete entry
router.delete('/entries/:id', async (req, res) => {
    try {
        await DairyEntry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── MONTHLY BILL ─────────────────────────────────────────────

// Get monthly bill summary per customer
router.get('/monthly-bill', async (req, res) => {
    try {
        const { email, year, month } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) ?? new Date().getMonth();
        const from = new Date(y, m, 1);
        const to = new Date(y, m + 1, 0, 23, 59, 59);

        const entries = await DairyEntry.find({ email, date: { $gte: from, $lte: to } });

        // Group by customerName
        const billMap = {};
        entries.forEach(e => {
            if (!billMap[e.customerName]) {
                billMap[e.customerName] = { customerName: e.customerName, totalLitres: 0, totalAmount: 0, paidAmount: 0, entries: 0 };
            }
            billMap[e.customerName].totalLitres += e.totalLitres;
            billMap[e.customerName].totalAmount += e.totalAmount;
            if (e.isPaid) billMap[e.customerName].paidAmount += e.totalAmount;
            billMap[e.customerName].entries++;
        });

        res.json(Object.values(billMap));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

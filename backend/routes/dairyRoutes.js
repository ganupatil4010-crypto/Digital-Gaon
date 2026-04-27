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
        if (!email || !customerName) return res.status(400).json({ error: 'Missing fields' });
        const customer = new DairyCustomer({ email, customerName, phoneNumber, morningQty: morningQty || 0, eveningQty: eveningQty || 0, ratePerLitre: ratePerLitre || 0 });
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

// Get entries (optionally filter by date range and customer)
router.get('/entries', async (req, res) => {
    try {
        const { email, from, to, customerId } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });
        const filter = { email };
        if (customerId) filter.customerId = customerId;
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }
        const entries = await DairyEntry.find(filter).sort({ date: 1 }); // Sort by date ascending for bills
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

        // Group by customerId
        const billMap = {};
        entries.forEach(e => {
            const key = e.customerId || e.customerName; // fallback for old entries
            if (!billMap[key]) {
                billMap[key] = { 
                    customerId: e.customerId, 
                    customerName: e.customerName, 
                    totalLitres: 0, 
                    totalAmount: 0, 
                    paidAmount: 0, 
                    entries: 0 
                };
            }
            billMap[key].totalLitres += e.totalLitres;
            billMap[key].totalAmount += e.totalAmount;
            if (e.isPaid) billMap[key].paidAmount += e.totalAmount;
            billMap[key].entries++;
        });

        res.json(Object.values(billMap));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

const DairyUdhaar = require('../models/DairyUdhaar');

// ... (existing routes)

// ─── UDHAAR KHATA ─────────────────────────────────────────────

// Get all udhaar for a user
router.get('/udhaar', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });
        const udhaar = await DairyUdhaar.find({ email, isSettle: false }).sort({ date: -1 });
        res.json(udhaar);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new udhaar entry
router.post('/udhaar', async (req, res) => {
    try {
        const { email, customerName, phoneNumber, amount } = req.body;
        if (!email || !customerName || !amount) return res.status(400).json({ error: 'Missing fields' });
        const entry = new DairyUdhaar({ email, customerName, phoneNumber, amount });
        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Settle (Delete/Archive) udhaar
router.delete('/udhaar/:id', async (req, res) => {
    try {
        await DairyUdhaar.findByIdAndDelete(req.params.id);
        res.json({ message: 'Udhaar settled' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

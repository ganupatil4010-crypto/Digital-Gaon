const express = require('express');
const router = express.Router();
const AgriInventory = require('../models/AgriInventory');
const AgriSale = require('../models/AgriSale');
const AgriUdhaar = require('../models/AgriUdhaar');

// --- INVENTORY ---

// Get inventory
router.get('/inventory', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });
        const items = await AgriInventory.find({ email }).sort({ itemName: 1 });
        res.json(items);
    } catch (err) {
        console.error('Agri Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add/Update inventory item
router.post('/inventory', async (req, res) => {
    try {
        const { email, id, itemName, category, stock, unit, pricePerUnit, expiryDate } = req.body;
        if (!email || !itemName) return res.status(400).json({ error: 'Missing fields' });

        if (id) {
            const item = await AgriInventory.findByIdAndUpdate(id, { 
                itemName, category, stock, unit, pricePerUnit, expiryDate 
            }, { new: true });
            return res.json(item);
        }

        const newItem = new AgriInventory({ email, itemName, category, stock, unit, pricePerUnit, expiryDate });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        console.error('Agri Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete item
router.delete('/inventory/:id', async (req, res) => {
    try {
        await AgriInventory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- SALES ---

// Log a sale
router.post('/sales', async (req, res) => {
    try {
        const { email, farmerName, phoneNumber, items, totalAmount, paymentMode } = req.body;
        if (!email || !farmerName || !items || items.length === 0) return res.status(400).json({ error: 'Missing fields' });

        const sale = new AgriSale({ email, farmerName, phoneNumber, items, totalAmount, paymentMode });
        await sale.save();

        // If payment is credit, add to Udhaar
        if (paymentMode === 'Credit') {
            const udhaar = new AgriUdhaar({ email, farmerName, phoneNumber, amount: totalAmount });
            await udhaar.save();
        }

        // Reduce stock
        for (const it of items) {
            await AgriInventory.findByIdAndUpdate(it.itemId, { $inc: { stock: -it.quantity } });
        }

        res.status(201).json(sale);
    } catch (err) {
        console.error('Agri Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get sales history
router.get('/sales', async (req, res) => {
    try {
        const { email } = req.query;
        const sales = await AgriSale.find({ email }).sort({ date: -1 }).limit(50);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a sale
router.delete('/sales/:id', async (req, res) => {
    try {
        console.log('--- DELETING SALE ---', req.params.id);
        const result = await AgriSale.findByIdAndDelete(req.params.id);
        if (!result) {
            console.log('Sale not found');
            return res.status(404).json({ error: 'Sale not found' });
        }
        res.json({ message: 'Sale deleted' });
    } catch (err) {
        console.error('Delete Sale Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- UDHAAR ---

// Get udhaar list
router.get('/udhaar', async (req, res) => {
    try {
        const { email } = req.query;
        const list = await AgriUdhaar.find({ email, isSettled: false }).sort({ date: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Settle udhaar
router.put('/udhaar/:id/settle', async (req, res) => {
    try {
        await AgriUdhaar.findByIdAndUpdate(req.params.id, { isSettled: true });
        res.json({ message: 'Settled' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

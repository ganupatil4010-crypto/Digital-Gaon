const mongoose = require('mongoose');
const { secondaryDB } = require('../config/db');

const agriInventorySchema = new mongoose.Schema({
    email: { type: String, required: true, index: true },
    itemName: { type: String, required: true },
    category: { type: String, enum: ['Seeds', 'Fertilizer', 'Pesticides', 'Tools', 'Other'], required: true },
    stock: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: 'unit' }, // kg, bags, packets, etc.
    pricePerUnit: { type: Number, required: true },
    expiryDate: { type: Date, default: null }
}, { timestamps: true });

module.exports = secondaryDB.model('AgriInventory', agriInventorySchema);

const mongoose = require('mongoose');
const { secondaryDB } = require('../config/db');

const agriSaleSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    phoneNumber: { type: String, default: '' },
    items: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgriInventory' },
        itemName: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    paymentMode: { type: String, enum: ['Cash', 'Online', 'Credit'], default: 'Cash' },
    date: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = secondaryDB.model('AgriSale', agriSaleSchema);

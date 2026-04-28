const mongoose = require('mongoose');
const { secondaryDB } = require('../config/db');

const agriUdhaarSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    phoneNumber: { type: String, default: '' },
    amount: { type: Number, required: true },
    isSettled: { type: Boolean, default: false },
    date: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = secondaryDB.model('AgriUdhaar', agriUdhaarSchema);

const mongoose = require('mongoose');

const dairyUdhaarSchema = new mongoose.Schema({
    email: { type: String, required: true },
    customerName: { type: String, required: true },
    phoneNumber: String,
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    isSettle: { type: Boolean, default: false }
});

module.exports = mongoose.model('DairyUdhaar', dairyUdhaarSchema);

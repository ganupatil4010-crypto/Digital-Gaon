const mongoose = require('mongoose');

// Daily milk delivery entry per customer
const dairyEntrySchema = new mongoose.Schema({
    email: { type: String, required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DairyCustomer' },
    customerName: { type: String, required: true },
    date: { type: Date, default: Date.now, index: true },
    morningQty: { type: Number, default: 0, min: 0 },
    eveningQty: { type: Number, default: 0, min: 0 },
    ratePerLitre: { type: Number, required: true },
    totalLitres: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('DairyEntry', dairyEntrySchema);

const mongoose = require('mongoose');

const YatraBookingSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    phoneNumber: { type: String },
    destination: { type: String, required: true },
    tripDate: { type: Date, required: true },
    totalAmount: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    status: { type: String, enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('YatraBooking', YatraBookingSchema);

const mongoose = require('mongoose');

const hotelOrderSchema = new mongoose.Schema({
    email: { type: String, required: true },
    tableName: { type: String, required: true },
    items: [{
        name: String,
        price: Number,
        qty: Number
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Served', 'Paid'], default: 'Pending' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HotelOrder', hotelOrderSchema);

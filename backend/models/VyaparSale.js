const mongoose = require('mongoose');

const vyaparSaleSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    itemName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    quantitySold: {
        type: Number,
        required: true,
        min: 1
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('VyaparSale', vyaparSaleSchema);

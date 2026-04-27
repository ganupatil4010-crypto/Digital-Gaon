const mongoose = require('mongoose');

const vyaparUdhaarSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('VyaparUdhaar', vyaparUdhaarSchema);

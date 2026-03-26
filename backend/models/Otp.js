const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0 // This will automatically delete the document at expiresAt
    }
}, { timestamps: true, bufferCommands: false });

module.exports = mongoose.model('Otp', otpSchema);

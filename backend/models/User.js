const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { primaryDB } = require('../config/db');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        default: ''
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    village: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    vyaparAccess: {
        type: String,
        enum: ['none', 'pending', 'approved'],
        default: 'none'
    },
    dairyAccess: {
        type: String,
        enum: ['none', 'pending', 'approved'],
        default: 'none'
    },
    pashuAccess: {
        type: String,
        enum: ['none', 'pending', 'approved'],
        default: 'none'
    },
    yatraAccess: {
        type: String,
        enum: ['none', 'pending', 'approved'],
        default: 'none'
    },
    hotelAccess: {
        type: String,
        enum: ['none', 'pending', 'approved'],
        default: 'none'
    },
    agriAccess: {
        type: String,
        enum: ['none', 'pending', 'approved'],
        default: 'none'
    }
}, { timestamps: true, bufferCommands: false });

// Password hashing moved to controller for debugging
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = primaryDB.model('User', userSchema);

module.exports = User;

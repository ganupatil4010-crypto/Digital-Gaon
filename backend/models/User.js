const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: '',
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
}, { timestamps: true, bufferCommands: false });

module.exports = mongoose.model('User', userSchema);

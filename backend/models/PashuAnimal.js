const mongoose = require('mongoose');

const pashuAnimalSchema = new mongoose.Schema({
  email: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerPhone: { type: String, default: '' },
  ownerVillage: { type: String, default: '' },
  animalType: { type: String, enum: ['Gaay', 'Bhains', 'Bakri', 'Bhed', 'Suvar', 'Ghoda', 'Kutta', 'Other'], required: true },
  tagId: { type: String, default: '' },
  animalName: { type: String, default: '' },
  age: { type: String, default: '' },
  gender: { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Unknown' },
  color: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('PashuAnimal', pashuAnimalSchema);

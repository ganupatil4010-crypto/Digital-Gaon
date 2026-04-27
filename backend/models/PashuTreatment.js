const mongoose = require('mongoose');

const pashuTreatmentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'PashuAnimal', required: true },
  animalType: { type: String, required: true },
  ownerName: { type: String, required: true },
  animalName: { type: String, default: '' },
  type: { type: String, enum: ['Ilaj', 'Tika', 'Check-up', 'Surgery', 'Other'], required: true },
  diagnosis: { type: String, default: '' },
  medicine: { type: String, default: '' },
  dosage: { type: String, default: '' },
  charge: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  nextDueDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('PashuTreatment', pashuTreatmentSchema);

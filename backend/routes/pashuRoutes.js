const express = require('express');
const router = express.Router();
const PashuAnimal = require('../models/PashuAnimal');
const PashuTreatment = require('../models/PashuTreatment');

// ─── ANIMALS ───────────────────────────────────────────────
// Get all animals for a vet
router.get('/animals', async (req, res) => {
  try {
    const { email } = req.query;
    const animals = await PashuAnimal.find({ email }).sort({ createdAt: -1 });
    res.json(animals);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Add animal
router.post('/animals', async (req, res) => {
  try {
    const animal = new PashuAnimal(req.body);
    await animal.save();
    res.json(animal);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Delete animal
router.delete('/animals/:id', async (req, res) => {
  try {
    await PashuAnimal.findByIdAndDelete(req.params.id);
    await PashuTreatment.deleteMany({ animalId: req.params.id });
    res.json({ message: 'Deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── TREATMENTS ────────────────────────────────────────────
// Get all treatments for a vet
router.get('/treatments', async (req, res) => {
  try {
    const { email } = req.query;
    const treatments = await PashuTreatment.find({ email }).sort({ date: -1 });
    res.json(treatments);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Add treatment
router.post('/treatments', async (req, res) => {
  try {
    const t = new PashuTreatment(req.body);
    await t.save();
    res.json(t);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Delete treatment
router.delete('/treatments/:id', async (req, res) => {
  try {
    await PashuTreatment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── REMINDERS (next due within 30 days) ──────────────────
router.get('/reminders', async (req, res) => {
  try {
    const { email } = req.query;
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const reminders = await PashuTreatment.find({
      email,
      nextDueDate: { $gte: now, $lte: in30 }
    }).sort({ nextDueDate: 1 });
    res.json(reminders);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── STATS ────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { email } = req.query;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [totalAnimals, monthlyTreatments, upcomingTikas, monthlyEarnings] = await Promise.all([
      PashuAnimal.countDocuments({ email }),
      PashuTreatment.countDocuments({ email, date: { $gte: startOfMonth } }),
      PashuTreatment.countDocuments({ email, nextDueDate: { $gte: now, $lte: in7 } }),
      PashuTreatment.aggregate([
        { $match: { email, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$charge' } } }
      ])
    ]);

    res.json({
      totalAnimals,
      monthlyTreatments,
      upcomingTikas,
      monthlyEarnings: monthlyEarnings[0]?.total || 0
    });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adController = require('../controllers/adController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { protect, restrictTo } = require('../middleware/authMiddleware');

const isAdmin = [protect, restrictTo('admin')];

router.get('/stats', isAdmin, adminController.getStats);
router.get('/users', isAdmin, adminController.getAllUsers);
router.get('/products', isAdmin, adminController.getAllProducts);
router.delete('/users/:id', isAdmin, adminController.deleteUser);
router.delete('/products/:id', isAdmin, adminController.deleteProduct);

// Ads management routes (Moved here for better stability)
router.get('/ads', isAdmin, adController.getAllAds);
router.post('/ads', isAdmin, adController.createAd);
router.delete('/ads/:id', isAdmin, adController.deleteAd);
router.post('/ads/delete/:id', isAdmin, adController.deleteAd);
router.patch('/ads/:id/toggle', isAdmin, adController.toggleAdStatus);

module.exports = router;

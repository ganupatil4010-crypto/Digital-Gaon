const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

router.get('/wishlist', protect, userController.getWishlist);
router.post('/wishlist', protect, userController.addToWishlist);
router.delete('/wishlist', protect, userController.removeFromWishlist);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const db = require('../database');
const jwt = require('jsonwebtoken');

// Middleware to verify admin
const isAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = db.prepare('SELECT role FROM users WHERE email = ?').get(decoded.email);
        
        if (user && user.role === 'admin') {
            req.user = decoded;
            next();
        } else {
            res.status(403).json({ error: 'Admin access required' });
        }
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.get('/stats', isAdmin, adminController.getStats);
router.get('/users', isAdmin, adminController.getAllUsers);
router.get('/products', isAdmin, adminController.getAllProducts);
router.delete('/users/:id', isAdmin, adminController.deleteUser);
router.delete('/products/:id', isAdmin, adminController.deleteProduct);

module.exports = router;

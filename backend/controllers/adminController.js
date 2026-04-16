const db = require('../database');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
        const wishlistCount = db.prepare('SELECT COUNT(*) as count FROM wishlist').get().count;
        
        res.status(200).json({
            users: userCount,
            products: productCount,
            wishlistItems: wishlistCount
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = db.prepare('SELECT id, email, name, village, phone, avatar, role, createdAt FROM users ORDER BY createdAt DESC').all();
        res.status(200).json(users);
    } catch (error) {
        console.error('Admin Fetch Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// GET /api/admin/products
exports.getAllProducts = async (req, res) => {
    try {
        const products = db.prepare(`
            SELECT p.*, u.name as sellerName 
            FROM products p
            LEFT JOIN users u ON p.sellerEmail = u.email
            ORDER BY p.createdAt DESC
        `).all();
        
        const mapped = products.map(p => ({ ...p, _id: p.id }));
        res.status(200).json(mapped);
    } catch (error) {
        console.error('Admin Fetch Products Error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Don't allow deleting self? (optional)
        
        db.prepare('DELETE FROM users WHERE id = ?').run(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin Delete User Error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        db.prepare('DELETE FROM products WHERE id = ?').run(id);
        db.prepare('DELETE FROM wishlist WHERE productId = ?').run(id);
        
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Admin Delete Product Error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

const db = require('../database');

// GET /api/user/profile?email=...
exports.getProfile = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user) {
            return res.status(200).json({ email, name: '', village: '', phone: '', avatar: '' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
    try {
        const { email, name, village, phone, avatar } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Upsert: try update first, if no rows affected then insert
        const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (existing) {
            db.prepare(`
                UPDATE users SET name = ?, village = ?, phone = ?, avatar = ?, updatedAt = datetime('now')
                WHERE email = ?
            `).run(name || '', village || '', phone || '', avatar || '', email);
        } else {
            db.prepare(`
                INSERT INTO users (email, name, village, phone, avatar)
                VALUES (?, ?, ?, ?, ?)
            `).run(email, name || '', village || '', phone || '', avatar || '');
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// GET /api/user/wishlist?email=...
exports.getWishlist = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const items = db.prepare(`
            SELECT p.*, p.id as _id,
                   u.name AS sellerName, 
                   u.village AS sellerVillage, 
                   u.phone AS sellerPhone, 
                   u.avatar AS sellerAvatar
            FROM wishlist w
            JOIN products p ON w.productId = p.id
            LEFT JOIN users u ON p.sellerEmail = u.email
            WHERE w.userEmail = ?
            ORDER BY w.createdAt DESC
        `).all(email);

        // Map id to _id for frontend
        const mapped = items.map(item => ({ ...item, _id: item.id }));

        res.status(200).json(mapped);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Failed to fetch wishlist' });
    }
};

// POST /api/user/wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { email, productId } = req.body;
        if (!email || !productId) {
            return res.status(400).json({ message: 'Email and productId are required' });
        }

        try {
            db.prepare(`
                INSERT OR IGNORE INTO wishlist (userEmail, productId) VALUES (?, ?)
            `).run(email, productId);
        } catch (e) {
            // Duplicate entry, ignore
        }

        // Return updated wishlist
        const items = db.prepare(`
            SELECT p.*, p.id as _id,
                   u.name AS sellerName, 
                   u.village AS sellerVillage, 
                   u.phone AS sellerPhone, 
                   u.avatar AS sellerAvatar
            FROM wishlist w
            JOIN products p ON w.productId = p.id
            LEFT JOIN users u ON p.sellerEmail = u.email
            WHERE w.userEmail = ?
        `).all(email);

        const mapped = items.map(item => ({ ...item, _id: item.id }));

        res.status(200).json({ message: 'Added to wishlist', wishlist: mapped });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Failed to add to wishlist' });
    }
};

// DELETE /api/user/wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { email, productId } = req.body;
        if (!email || !productId) {
            return res.status(400).json({ message: 'Email and productId are required' });
        }

        db.prepare('DELETE FROM wishlist WHERE userEmail = ? AND productId = ?').run(email, productId);

        // Return updated wishlist
        const items = db.prepare(`
            SELECT p.*, p.id as _id,
                   u.name AS sellerName, 
                   u.village AS sellerVillage, 
                   u.phone AS sellerPhone, 
                   u.avatar AS sellerAvatar
            FROM wishlist w
            JOIN products p ON w.productId = p.id
            LEFT JOIN users u ON p.sellerEmail = u.email
            WHERE w.userEmail = ?
        `).all(email);

        const mapped = items.map(item => ({ ...item, _id: item.id }));

        res.status(200).json({ message: 'Removed from wishlist', wishlist: mapped });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Failed to remove from wishlist' });
    }
};

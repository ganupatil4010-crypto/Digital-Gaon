const db = require('../database');

// Add a new product
exports.addProduct = async (req, res) => {
    try {
        const { title, price, category, location, description, sellerEmail, img } = req.body;

        if (!title || !price || !category || !location) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        const stmt = db.prepare(`
            INSERT INTO products (title, price, category, location, description, sellerEmail, img)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            title, 
            price, 
            category, 
            location, 
            description || '', 
            sellerEmail || '', 
            img || 'https://images.unsplash.com/photo-1592982537447-6f23b3793f77?auto=format&fit=crop&q=80&w=400'
        );

        const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

        // Map id to _id for frontend compatibility
        newProduct._id = newProduct.id;

        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        console.error('Add Product Error:', error);
        res.status(500).json({ error: 'Something went wrong while adding product' });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all();

        // Map id to _id for frontend compatibility
        const mapped = products.map(p => ({ ...p, _id: p.id }));

        res.status(200).json(mapped);
    } catch (error) {
        console.error('Fetch Products Error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// Get products of a specific user (for MyListings)
exports.getMyProducts = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const products = db.prepare('SELECT * FROM products WHERE sellerEmail = ? ORDER BY createdAt DESC').all(email);

        const mapped = products.map(p => ({ ...p, _id: p.id }));

        res.status(200).json(mapped);
    } catch (error) {
        console.error('Fetch My Products Error:', error);
        res.status(500).json({ error: 'Failed to fetch your products' });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Only the seller can delete their own product
        if (product.sellerEmail !== email) {
            return res.status(403).json({ error: 'You can only delete your own products' });
        }

        db.prepare('DELETE FROM products WHERE id = ?').run(id);

        // Also remove from all wishlists
        db.prepare('DELETE FROM wishlist WHERE productId = ?').run(id);

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete Product Error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

// Edit a product
exports.editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, title, price, category, location, description, img } = req.body;

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.sellerEmail !== email) {
            return res.status(403).json({ error: 'You can only edit your own products' });
        }

        db.prepare(`
            UPDATE products 
            SET title = ?, price = ?, category = ?, location = ?, description = ?, img = ?
            WHERE id = ?
        `).run(
            title || product.title, 
            price || product.price, 
            category || product.category, 
            location || product.location, 
            description !== undefined ? description : product.description, 
            img || product.img,
            id
        );

        const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        updatedProduct._id = updatedProduct.id;

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        console.error('Edit Product Error:', error);
        res.status(500).json({ error: 'Failed to edit product' });
    }
};

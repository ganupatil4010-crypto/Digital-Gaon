const Product = require('../models/Product');
const User = require('../models/User');

// Add a new product
exports.addProduct = async (req, res) => {
    try {
        const { title, price, category, location, description, sellerEmail, img } = req.body;

        if (!title || !price || !category || !location) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        const newProduct = await Product.create({
            title,
            price,
            category,
            location,
            description: description || '',
            sellerEmail: sellerEmail || '',
            img: img || 'https://images.unsplash.com/photo-1592982537447-6f23b3793f77?auto=format&fit=crop&q=80&w=400'
        });

        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        console.error('Add Product Error:', error);
        res.status(500).json({ error: 'Something went wrong while adding product' });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        // In MongoDB, we use populate or manual join if needed. 
        // Here we can fetch products and manually map seller info if users are in the same DB.
        const products = await Product.find().sort({ createdAt: -1 }).lean();
        
        // Manual join for seller info (simulating SQL JOIN)
        const productsWithSellers = await Promise.all(products.map(async (p) => {
            const user = await User.findOne({ email: p.sellerEmail }).lean();
            return {
                ...p,
                sellerName: user?.name || 'Unknown',
                sellerVillage: user?.village || 'Unknown',
                sellerPhone: user?.phone || 'Unknown',
                sellerAvatar: user?.avatar || ''
            };
        }));

        res.status(200).json(productsWithSellers);
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

        const products = await Product.find({ sellerEmail: email }).sort({ createdAt: -1 }).lean();

        const productsWithSellers = await Promise.all(products.map(async (p) => {
            const user = await User.findOne({ email: p.sellerEmail }).lean();
            return {
                ...p,
                sellerName: user?.name || 'Unknown',
                sellerVillage: user?.village || 'Unknown',
                sellerPhone: user?.phone || 'Unknown',
                sellerAvatar: user?.avatar || ''
            };
        }));

        res.status(200).json(productsWithSellers);
    } catch (error) {
        console.error('Fetch My Products Error:', error);
        res.status(500).json({ error: 'Failed to fetch your products' });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.query;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Only the seller can delete their own product
        if (product.sellerEmail.toLowerCase() !== email.toLowerCase()) {
            return res.status(403).json({ error: 'You can only delete your own products' });
        }

        await Product.findByIdAndDelete(id);

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

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.sellerEmail !== email) {
            return res.status(403).json({ error: 'You can only edit your own products' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { 
                title: title || product.title,
                price: price || product.price,
                category: category || product.category,
                location: location || product.location,
                description: description !== undefined ? description : product.description,
                img: img || product.img
            },
            { new: true }
        );

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        console.error('Edit Product Error:', error);
        res.status(500).json({ error: 'Failed to edit product' });
    }
};

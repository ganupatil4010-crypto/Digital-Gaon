const User = require('../models/User');
const Product = require('../models/Product');

// GET /api/user/profile?email=...
exports.getProfile = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        let user = await User.findOne({ email });
        const ADMIN_EMAIL = 'tgund5858@gmail.com';

        if (!user) {
            const role = email === ADMIN_EMAIL ? 'admin' : 'user';
            return res.status(200).json({ email, name: '', village: '', phone: '', avatar: '', role });
        }

        // Security: Force role based on authorized email
        const updatedRole = email === ADMIN_EMAIL ? 'admin' : 'user';
        
        const responseData = {
            ...user.toObject(),
            role: updatedRole
        };

        res.status(200).json(responseData);

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

        const user = await User.findOneAndUpdate(
            { email },
            { name, village, phone, avatar },
            { upsert: true, new: true }
        );

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

        const user = await User.findOne({ email }).lean();
        if (!user || !user.wishlist) {
            return res.status(200).json([]);
        }

        const items = await Product.find({ _id: { $in: user.wishlist } }).lean();

        // Join seller info
        const mapped = await Promise.all(items.map(async (p) => {
            const seller = await User.findOne({ email: p.sellerEmail }).lean();
            return {
                ...p,
                sellerName: seller?.name || 'Unknown',
                sellerVillage: seller?.village || 'Unknown',
                sellerPhone: seller?.phone || 'Unknown',
                sellerAvatar: seller?.avatar || ''
            };
        }));

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

        const user = await User.findOneAndUpdate(
            { email },
            { $addToSet: { wishlist: productId } },
            { upsert: true, new: true }
        );

        // Fetch updated wishlist items
        const items = await Product.find({ _id: { $in: user.wishlist } }).lean();
        const mapped = await Promise.all(items.map(async (p) => {
            const seller = await User.findOne({ email: p.sellerEmail }).lean();
            return {
                ...p,
                sellerName: seller?.name || 'Unknown',
                sellerVillage: seller?.village || 'Unknown',
                sellerPhone: seller?.phone || 'Unknown',
                sellerAvatar: seller?.avatar || ''
            };
        }));

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

        const user = await User.findOneAndUpdate(
            { email },
            { $pull: { wishlist: productId } },
            { new: true }
        );

        // Fetch updated wishlist items
        const items = await Product.find({ _id: { $in: (user?.wishlist || []) } }).lean();
        const mapped = await Promise.all(items.map(async (p) => {
            const seller = await User.findOne({ email: p.sellerEmail }).lean();
            return {
                ...p,
                sellerName: seller?.name || 'Unknown',
                sellerVillage: seller?.village || 'Unknown',
                sellerPhone: seller?.phone || 'Unknown',
                sellerAvatar: seller?.avatar || ''
            };
        }));

        res.status(200).json({ message: 'Removed from wishlist', wishlist: mapped });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Failed to remove from wishlist' });
    }
};

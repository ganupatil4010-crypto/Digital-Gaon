const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id, user.role);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = async (req, res) => {
    try {
        console.log('[Signup] Request body:', req.body);
        const { name, email, password } = req.body;

        // Hardcoded Admin Check
        const role = email === 'tgund5858@gmail.com' ? 'admin' : 'user';
        console.log('[Signup] Assigned role:', role);

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });
        console.log('[Signup] User created successfully');

        createSendToken(newUser, 201, res);
    } catch (err) {
        console.error('[Signup] Error occurred:', err);
        
        let message = 'An error occurred during sign up';
        if (err.code === 11000) {
            message = 'This email is already registered. Please try logging in.';
        } else if (err.message) {
            message = err.message;
        }

        res.status(400).json({
            status: 'fail',
            message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1) Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password'
            });
        }

        // 2) Check if user exists && password is correct
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password'
            });
        }

        // 3) If everything ok, send token to client
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

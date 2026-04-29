const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Senior diagnostics: Verify SMTP connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('--- SMTP VERIFICATION FAILED ---');
        console.error('Error Code:', error.code);
        console.error('Message:', error.message);
    } else {
        console.log('--- SMTP SERVER READY FOR OTP DELIVERY ✅ ---');
    }
});



exports.sendOtp = async (req, res) => {
    console.log('--- Send OTP Request Received ---');
    try {
        const { email } = req.body;
        console.log('Email to send to:', email);

        if (!email) {
            console.log('Error: No email provided in request body');
            return res.status(400).json({ message: 'Email is required' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save OTP to MongoDB (upsert style)
        await Otp.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, new: true }
        );
        console.log('OTP saved to MongoDB Cloud.');

        if (process.env.DEV_MODE === 'true') {
            console.log('DEV_MODE is true. OTP:', otp);
            return res.status(200).json({
                message: 'OTP sent successfully (DEV MODE: 123456)',
                devOtp: '123456'
            });
        }
        // ... rest of email logic ...

        // Send email
        const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_gmail@gmail.com' && process.env.EMAIL_PASS !== 'your_app_password';
        console.log('Is email configured?', isEmailConfigured);

        if (!isEmailConfigured) {
            console.log('Using MOCK email delivery (No credentials found in .env)');
            return res.status(200).json({
                message: 'OTP sent successfully (MOCK MODE: 123456)',
                devOtp: '123456'
            });
        }

        console.log('Attempting to send real email via Gmail SMTP...');

        const mailOptions = {
            from: `"Digital Gaon Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your 6-Digit OTP Code',
            text: `Welcome! Your verification code is: ${otp}. It will expire in 5 minutes.`
        };

        // Fire and forget email sending to avoid blocking the user
        transporter.sendMail(mailOptions).then(info => {
            console.log('Email sent successfully in background! MessageId:', info.messageId);
        }).catch(mailError => {
            console.error('BACKGROUND Nodemailer Error:', mailError.message);
        });

        // Respond to user immediately
        return res.status(200).json({ message: 'OTP sending initiated' });
    } catch (error) {
        console.error('General Controller Error:', error.message);
        res.status(500).json({ message: 'Internal server error occurred' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        if (process.env.DEV_MODE === 'true' && otp === '123456') {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Ensure user is created in database during DEV_MODE login
            await User.findOneAndUpdate(
                { email },
                { $setOnInsert: { email } },
                { upsert: true, new: true }
            );

            return res.status(200).json({ message: 'OTP verified successfully (DEV MODE)', token });
        }

        const otpRecord = await Otp.findOne({ email, otp });

        if (!otpRecord || new Date(otpRecord.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP verified, create JWT
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Ensure user is created in database
        await User.findOneAndUpdate(
            { email },
            { $setOnInsert: { email } },
            { upsert: true, new: true }
        );

        // Cleanup
        await Otp.deleteOne({ email });

        res.status(200).json({
            message: 'OTP verified successfully',
            token
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
};

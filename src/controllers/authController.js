const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');
const redis = require('redis');

const tempUsers = {};

const initiateRegistration = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Check if the user already exists in the main database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Generate OTP and hash the password
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`Generated OTP for ${email}: ${otp}`);

        // Save temporary user data in memory
        tempUsers[email] = {
            username,
            hashedPassword,
            otp,
            otpExpires,
        };

        // Send OTP via email
        await sendEmail(email, 'Email Verification OTP', `Your OTP is: ${otp}`);

        res.status(200).json({ message: 'OTP sent to your email. Complete registration to proceed.' });
    } catch (err) {
        console.error('Error in initiateRegistration:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const completeRegistration = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Retrieve temporary user data from memory
        const tempUserData = tempUsers[email];
        if (!tempUserData) {
            return res.status(400).json({ error: 'No registration found for this email or OTP expired.' });
        }

        const { username, hashedPassword, otp: savedOtp, otpExpires } = tempUserData;

        // Validate OTP and expiration
        if (otp !== savedOtp || Date.now() > otpExpires) {
            return res.status(400).json({ error: 'Invalid or expired OTP.' });
        }

        // Save user to the main database
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            isEmailVerified: true,
        });
        await newUser.save();

        // Remove temporary data from memory
        delete tempUsers[email];

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        console.error('Error in completeRegistration:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(400).json({ error: 'Email is not verified. Please verify your email first.' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Store user ID in session
        if (req.session) {
            req.session.userId = user._id;
            console.log("Session userId set:", req.session.userId);
        } else {
            console.error("Session is not available.");
        }


        // Respond with token and user data
        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports = {
    initiateRegistration,
    completeRegistration,
    login
};
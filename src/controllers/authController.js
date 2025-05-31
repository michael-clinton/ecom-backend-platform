const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');

const tempUsers = {};

// Helper function to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const initiateRegistration = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required.' });
    }

    // Check if email already registered
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Check if username already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken. Please choose a different one.' });
    }

    // Generate OTP and hash password
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Generated OTP for ${email}: ${otp}`);

    // Save temp registration info keyed by email
    tempUsers[email] = {
      username,       // Store username directly
      hashedPassword,
      otp,
      otpExpires,
    };

    await sendEmail(email, 'Email Verification OTP', `Your OTP is: ${otp}`);

    res.status(200).json({ message: 'OTP sent to your email. Complete registration to proceed.' });
  } catch (err) {
    console.error('Error in initiateRegistration:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Complete registration: verify OTP and create user
const completeRegistration = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const tempUserData = tempUsers[email];
    if (!tempUserData) {
      return res.status(400).json({ error: 'No registration found for this email or OTP expired.' });
    }

    const { username, hashedPassword, otp: savedOtp, otpExpires } = tempUserData;

    if (otp !== savedOtp || Date.now() > otpExpires) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Create new user document
    const newUser = new User({
      username,              // Use username field consistently
      email,
      password: hashedPassword,
      isEmailVerified: true,
    });

    await newUser.save();

    // Remove temp user data on successful registration
    delete tempUsers[email];

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('Error in completeRegistration:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Login: validate user credentials and create session + JWT
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Find user by username (consistent with registration)
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is not verified.' });
    }

    if (!user.password) {
      return res.status(500).json({ error: 'User password is missing.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },  // Use username in JWT payload
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // If no session middleware, just return token and user info
    if (!req.session) {
      return res.status(200).json({
        message: 'Login successful.',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    }

    // Save userId in session and then return response
    req.session.userId = user._id.toString();

    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session save failed.' });
      }

      return res.status(200).json({
        message: 'Login successful.',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Check if username is available
const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      return res.json({ available: false });
    }
    return res.json({ available: true });
  } catch (error) {
    console.error("Error checking username availability:", error);
    return res.status(500).json({ available: false });
  }
};

// Check if email is available
const checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ available: false });
    }
    return res.json({ available: true });
  } catch (error) {
    console.error("Error checking email availability:", error);
    return res.status(500).json({ available: false });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP via email using your mailer utility
    await sendEmail(email, "Reset your password", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  initiateRegistration,
  completeRegistration,
  login,
  forgotPassword,
  resetPassword,
    checkUsernameAvailability,
  checkEmailAvailability,
};

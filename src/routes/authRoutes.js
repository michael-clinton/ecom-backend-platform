const express = require('express');
const { 
    initiateRegistration, 
    completeRegistration, 
    login, 
    forgotPassword,
    resetPassword,
      checkUsernameAvailability,
  checkEmailAvailability,

} = require('../controllers/authController');
const { handleContactForm } = require('../controllers/contactController'); // Import handleContactForm
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Registration routes
router.post('/initiate-registration', initiateRegistration);
router.post('/complete-registration', completeRegistration);
// router.post("/google-login", googleLogin);

// Login route
router.post('/login', login);

// Protected products route
router.get("/products", authenticateToken, (req, res) => {
    res.status(200).json({ message: "Authorized to access products." });
});

// Contact route
// router.post('/contact', authenticateToken, handleContactForm);

router.post('/contact', authenticateToken, handleContactForm);

// Route to request a password reset (sends OTP to email)
router.post("/password/forgot", forgotPassword);

// Route to reset the password using OTP
router.post("/password/reset", resetPassword);

router.post("/check-username", checkUsernameAvailability);

// POST /api/auth/check-email
router.post("/check-email", checkEmailAvailability);

module.exports = router;

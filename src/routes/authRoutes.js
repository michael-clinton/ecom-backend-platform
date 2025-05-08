const express = require('express');
const { 
    initiateRegistration, 
    completeRegistration, 
    login 
} = require('../controllers/authController');
const { handleContactForm } = require('../controllers/contactController'); // Import handleContactForm
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Registration routes
router.post('/initiate-registration', initiateRegistration);
router.post('/complete-registration', completeRegistration);

// Login route
router.post('/login', login);

// Protected products route
router.get("/products", authenticateToken, (req, res) => {
    res.status(200).json({ message: "Authorized to access products." });
});

// Contact route
// router.post('/contact', authenticateToken, handleContactForm);

router.post('/contact', authenticateToken, handleContactForm);

module.exports = router;

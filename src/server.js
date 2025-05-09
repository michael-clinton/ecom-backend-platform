const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes and database connection
const authRoutes = require('./routes/authRoutes');
const featuredRoutes = require('./routes/featuredRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRouter = require('./routes/cartRoutes'); // Fixed import for cartRouter
const connectDB = require('./config/db');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const razorpayRoutes = require("./routes/razorpayRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

// Initialize the app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware for logging request and response
app.use((req, res, next) => {
  console.log(`API Called: ${req.method} ${req.originalUrl}`);

  // Capture the response status code once the response finishes
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`Response Status: ${res.statusCode}`);
    originalSend.call(this, data);
  };

  next(); // Proceed to the next middleware or route handler
});

// Middleware setup
const corsOptions = {
  origin: 'http://localhost:5173', // Specify the allowed origin
};
app.use(cors(corsOptions));
app.use(express.json()); // For parsing JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests
app.use(cookieParser()); // Add cookie-parser middleware to parse cookies
app.use(sessionMiddleware.getSessionId); // Add session middleware

// API Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/products', productRoutes); // Product routes
app.use('/api/featured', featuredRoutes); // Featured routes
app.use('/api/cart', cartRouter); // Cart routes
app.use('/api/payment', razorpayRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

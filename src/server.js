const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const session = require('express-session');

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
const testimonialRoutes = require("./routes/testimonialRoutes");
const offerRoutes = require("./routes/offerRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const trackPageView = require('./middleware/trackPageView');
const logUniqueVisitor = require('./middleware/logUniqueVisitor');

// Initialize the app
const app = express();

// Connect to MongoDB
connectDB();


app.use(trackPageView);
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

app.use(cors({
  origin: "https://ecom-frontend-platform.vercel.app", // allow only this origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // if using cookies/auth headers
}));

app.use(express.json()); // For parsing JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests
app.use(cookieParser()); // Add cookie-parser middleware to parse cookies
app.use(sessionMiddleware.getSessionId); // Add session middleware

app.use(logUniqueVisitor);
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24, // e.g., 1 day
  },
  // optionally setup a session store like MongoStore
}));

// API Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/products', productRoutes); // Product routes
app.use('/api/featured', featuredRoutes); // Featured routes
app.use('/api/cart', cartRouter); // Cart routes
app.use('/api/payment', razorpayRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/users', userRoutes);

app.use(trackPageView);
app.use('/api/analytics', trackPageView, analyticsRoutes);

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

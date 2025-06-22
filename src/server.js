const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const session = require('express-session');

// Import routes and database connection
const connectDB = require('./config/db');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const trackPageView = require('./middleware/trackPageView');
const logUniqueVisitor = require('./middleware/logUniqueVisitor');

const authRoutes = require('./routes/authRoutes');
const featuredRoutes = require('./routes/featuredRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRouter = require('./routes/cartRoutes');
const razorpayRoutes = require('./routes/razorpayRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const offerRoutes = require('./routes/offerRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Initialize the app
const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(trackPageView);
app.use(logUniqueVisitor);

// Log each request and its response status
app.use((req, res, next) => {
  console.log(`API Called: ${req.method} ${req.originalUrl}`);
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`Response Status: ${res.statusCode}`);
    originalSend.call(this, data);
  };
  next();
});

// CORS setup
const allowedOrigins = [
  'https://ecom-frontend-platform.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Body parsers and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware.getSessionId);

// Session setup (without using SESSION_SECRET from .env)
app.use(session({
  secret: 'my_super_secret_key', // Static key, you can change this
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true only if using HTTPS
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/featured', featuredRoutes);
app.use('/api/cart', cartRouter);
app.use('/api/payment', razorpayRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});

const express = require('express');
const router = express.Router();
const {
    getPageViews,
    getTotalUsers,
    getTotalOrders,
    getTotalSales
} = require('../controllers/analyticsController'); // Import the controller functions

// Route to get total page views
router.get('/page-views', getPageViews);

// Route to get total users
router.get('/total-users', getTotalUsers);

// Route to get total orders
router.get('/total-orders', getTotalOrders);

// Route to get total sales
router.get('/total-sales', getTotalSales);

module.exports = router;

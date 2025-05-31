const PageView = require('../models/PageView');
const User = require('../models/User');
const Order = require('../models/Order');

// Helper function to calculate percent change
const calculatePercentChange = (current, previous) => {
    if (previous === 0) return 100; // Avoid division by zero
    return ((current - previous) / previous) * 100;
};

// Fetch total page views
async function getPageViews(req, res) {
    try {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;

        const currentYearViews = await PageView.countDocuments({
            timestamp: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) }
        });

        const lastYearViews = await PageView.countDocuments({
            timestamp: { $gte: new Date(`${lastYear}-01-01`), $lte: new Date(`${lastYear}-12-31`) }
        });

        const difference = currentYearViews - lastYearViews;
        const percentChange = calculatePercentChange(currentYearViews, lastYearViews);

        res.json({
            totalPageViews: currentYearViews,
            percentChange: percentChange.toFixed(1),
            extraViews: difference,
        });
    } catch (error) {
        res.status(500).send({ error: 'Error fetching page views' });
    }
}

// Fetch total users
async function getTotalUsers(req, res) {
    try {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;

        const currentYearUsers = await User.countDocuments({
            createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) }
        });

        const lastYearUsers = await User.countDocuments({
            createdAt: { $gte: new Date(`${lastYear}-01-01`), $lte: new Date(`${lastYear}-12-31`) }
        });

        const difference = currentYearUsers - lastYearUsers;
        const percentChange = calculatePercentChange(currentYearUsers, lastYearUsers);

        res.json({
            totalUsers: currentYearUsers,
            percentChange: percentChange.toFixed(1),
            extraUsers: difference,
        });
    } catch (error) {
        res.status(500).send({ error: 'Error fetching user data' });
    }
}

// Fetch total orders
async function getTotalOrders(req, res) {
    try {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;

        const currentYearOrders = await Order.countDocuments({
            createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) }
        });

        const lastYearOrders = await Order.countDocuments({
            createdAt: { $gte: new Date(`${lastYear}-01-01`), $lte: new Date(`${lastYear}-12-31`) }
        });

        const difference = currentYearOrders - lastYearOrders;
        const percentChange = calculatePercentChange(currentYearOrders, lastYearOrders);

        res.json({
            totalOrders: currentYearOrders,
            percentChange: percentChange.toFixed(1),
            extraOrders: difference,
        });
    } catch (error) {
        res.status(500).send({ error: 'Error fetching order data' });
    }
}

// Fetch total sales
async function getTotalSales(req, res) {
    try {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;

        const currentYearSales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) },
                },
            },
            { $group: { _id: null, totalSales: { $sum: "$amount" } } },
        ]);

        const lastYearSales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(`${lastYear}-01-01`), $lte: new Date(`${lastYear}-12-31`) },
                },
            },
            { $group: { _id: null, totalSales: { $sum: "$amount" } } },
        ]);

        const currentSales = currentYearSales[0]?.totalSales || 0;
        const previousSales = lastYearSales[0]?.totalSales || 0;
        const difference = currentSales - previousSales;
        const percentChange = calculatePercentChange(currentSales, previousSales);

        res.json({
            totalSales: currentSales,
            percentChange: percentChange.toFixed(1),
            extraSales: difference,
        });
    } catch (error) {
        res.status(500).send({ error: 'Error fetching sales data' });
    }
}

module.exports = {
    getPageViews,
    getTotalUsers,
    getTotalOrders,
    getTotalSales,
};

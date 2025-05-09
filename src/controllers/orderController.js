const Order = require("../models/Order"); // Import the Order model

// Fetch Order History
const getOrderHistory = async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 }); // Fetch orders sorted by latest
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching order history:", error.message);
        res.status(500).json({ message: "Failed to fetch order history. Please try again." });
    }
};

module.exports = {
    getOrderHistory
};

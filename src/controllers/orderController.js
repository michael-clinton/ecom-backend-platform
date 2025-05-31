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

const getOrderStatus = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Validate the order ID
    if (!orderId.match(/^[a-fA-F0-9]{24}$/)) {
      return res.status(400).json({ message: "Invalid order ID format." });
    }

    // Fetch the order from the database
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Return the status of the order
    res.status(200).json({
      orderId: order._id,
      status: order.status, // Assuming the Order model has a 'status' field
      updatedAt: order.updatedAt, // Optionally include the last updated timestamp
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
    getOrderHistory,
    getOrderStatus
};

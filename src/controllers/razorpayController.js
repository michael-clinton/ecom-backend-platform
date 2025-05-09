const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Cart = require("../models/Cart"); // Assuming you have a Cart model
const Order = require("../models/Order");

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,   // Store Razorpay Key ID in environment variable
    key_secret: process.env.RAZORPAY_SECRET, // Store Razorpay Secret in environment variable
});

/**
 * Create an order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createOrder = async (req, res) => {
    const { amount } = req.body;

    // Validate the amount
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount." });
    }

    try {
        // Create an order with Razorpay
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert amount to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`, // Unique receipt ID
        });

        // Respond with the order ID
        res.status(200).json({ orderId: order.id });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Error creating order." });
    }
};


/**
 * Verify payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 // Assuming the Order schema is registered as "Order"

const verifyPayment = async (req, res) => {
    const { paymentId, orderId, razorpaySignature, amount, userId } = req.body;

    // Log incoming request data
    console.log("=== Payment Verification Start ===");
    console.log("Received Order ID:", orderId);
    console.log("Received Payment ID:", paymentId);
    console.log("Received Razorpay Signature:", razorpaySignature);

    if (!razorpaySignature) {
        console.error("Error: Razorpay signature is missing.");
        return res.status(400).json({ message: "Razorpay signature is missing." });
    }

    try {
        // Generate the signature using Razorpay secret
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(orderId + "|" + paymentId)
            .digest("hex");

        console.log("Generated Signature:", generatedSignature);

        // Compare the signatures
        if (generatedSignature !== razorpaySignature) {
            console.warn("Signature mismatch! Payment verification failed.");
            return res.status(400).json({ message: "Payment verification failed." });
        }

        console.log("Payment verification successful!");

        // Fetch user's cart
        const userCart = await Cart.findOne({ userId });
        if (!userCart || userCart.items.length === 0) {
            console.error("Error: User's cart is empty or not found.");
            return res.status(400).json({ message: "Cart is empty. Cannot create an order." });
        }

        // Create a new order
        const newOrder = new Order({
            userId,
            items: userCart.items,
            paymentId,
            orderId,
            amount,
            status: "Paid",
        });

        await newOrder.save();
        console.log("Order saved successfully:", newOrder);

        // Clear the user's cart
        userCart.items = [];
        await userCart.save();
        console.log("Cart cleared successfully for user:", userId);

        return res.status(200).json({ message: "Payment verified and order created successfully." });
    } catch (error) {
        console.error("Error occurred during payment verification:", error.message);
        console.error("Stack Trace:", error.stack);
        res.status(500).json({ message: "Internal server error during payment verification." });
    } finally {
        console.log("=== Payment Verification End ===");
    }
};

module.exports = { createOrder, verifyPayment };

const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Cart = require("../models/Cart"); // Assuming you have a Cart model
const Order = require("../models/Order");
const Product = require("../models/productModel");
const Featured = require("../models/featuredModel");

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

    console.log("=== Create Order Start ===");
    console.log("Received Amount:", amount);

    // Validate the amount
    if (!amount || amount <= 0) {
        console.error("Invalid amount provided:", amount);
        return res.status(400).json({ message: "Invalid amount." });
    }

    try {
        // Create an order with Razorpay
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert amount to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`, // Unique receipt ID
        });

        console.log("Order created successfully:", order);
        res.status(200).json({ orderId: order.id });
    } catch (error) {
        console.error("Error creating order:", error.message);
        console.error("Stack Trace:", error.stack);
        res.status(500).json({ message: "Error creating order." });
    } finally {
        console.log("=== Create Order End ===");
    }
};

/**
 * Verify payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyPayment = async (req, res) => {
    const { paymentId, orderId, razorpaySignature, amount, userId } = req.body;

    console.log("=== Payment Verification Start ===");
    console.log("Received Request Data:", { paymentId, orderId, razorpaySignature, amount, userId });

    // Validate required fields
    if (!paymentId || !orderId || !razorpaySignature || !amount || !userId) {
        console.error("Missing required fields:", { paymentId, orderId, razorpaySignature, amount, userId });
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        // Generate signature using Razorpay secret key
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");

        console.log("Generated Signature:", generatedSignature);

        // Verify signatures
        if (generatedSignature !== razorpaySignature) {
            console.warn("Signature mismatch! Payment verification failed.");
            return res.status(400).json({ success: false, message: "Payment verification failed." });
        }

        console.log("Payment verification successful!");

        // Fetch cart with populated product details
        console.log("Fetching cart for user ID:", userId);
        const userCart = await Cart.findOne({ userId }).populate({
            path: 'items',
            select: 'name price image productType sizes',
        });

        if (!userCart) {
            console.error("Cart not found for user ID:", userId);
            return res.status(400).json({ success: false, message: "Cart not found." });
        }

        if (!userCart.items || userCart.items.length === 0) {
            console.error("Cart is empty for user ID:", userId);
            return res.status(400).json({ success: false, message: "Cart is empty. Cannot create an order." });
        }

        console.log("User's cart items:", JSON.stringify(userCart.items, null, 2));

        const now = new Date();

        // Prepare order items
        const orderItems = userCart.items
            .filter(item => {
                if (!item.productId) {
                    console.warn("Item missing productId:", JSON.stringify(item, null, 2));
                    return false;
                }
                return true;
            })
            .map((item, index) => {
                const { _id, name, productType, price, image } = item;

                console.log(`Processing item ${index + 1}:`);
                console.log("  Product ID:", _id);
                console.log("  Name:", name);
                console.log("  Product Type:", productType);
                console.log("  Price:", price);
                console.log("  Image:", image);
                console.log("  Quantity:", item.quantity);
                console.log("  Size:", item.size);

                if (!name) throw new Error(`Product name missing for item index ${index + 1}`);
                if (price === undefined) throw new Error(`Product price missing for item index ${index + 1}`);
                if (!productType) throw new Error(`Product type missing for item index ${index + 1}`);

                return {
                    productId: _id,
                    name,
                    productType,
                    price,
                    image: image || null,
                    quantity: item.quantity || 1,
                    size: item.size || null,
                };
            });

        console.log("Prepared order items:", JSON.stringify(orderItems, null, 2));

        // Create and save the order
        const newOrder = new Order({
            userId,
            items: orderItems,
            paymentId,
            orderId,
            amount,
            status: "Paid",
            tracking: {
                paidAt: now,
                processingAt: null,
                shippedAt: null,
                deliveredAt: null,
                cancelledAt: null,
            },
        });

        await newOrder.save();
        console.log("Order saved successfully:", JSON.stringify(newOrder, null, 2));

        // Clear cart
        console.log("Clearing user's cart for user ID:", userId);
        userCart.items = [];
        await userCart.save();
        console.log("Cart cleared successfully for user ID:", userId);

        return res.status(200).json({
            success: true,
            message: "Payment verified and order created successfully.",
        });
    } catch (error) {
        console.error("Error occurred during payment verification:");
        console.error("  Message:", error.message);
        console.error("  Stack:", error.stack);
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`,
        });
    } finally {
        console.log("=== Payment Verification End ===");
    }
};

const verifyDirectPayment = async (req, res) => {
    const { paymentId, orderId, razorpaySignature, userId, productId, size, amount } = req.body;

    console.log("=== Verify Direct Payment Start ===");
    console.log("Request Data:", { paymentId, orderId, userId, productId, size, amount });

    // Validate required fields
    if (!paymentId || !orderId || !razorpaySignature || !userId || !productId || !amount) {
        console.error("Missing required fields:", req.body);
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        // Step 1: Verify payment signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");

        console.log("Generated Signature:", generatedSignature);
        console.log("Received Signature:", razorpaySignature);

        if (generatedSignature !== razorpaySignature) {
            console.error("Payment signature verification failed.");
            return res.status(400).json({ success: false, message: "Payment signature verification failed." });
        }

        console.log("Payment verification successful!");

        // Step 2: Validate product
        const product = await Featured.findById(productId);
        if (!product) {
            console.error("Product not found:", productId);
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        console.log("Available sizes for product:", product.sizes);
        console.log("Requested size:", size);

        const normalizedSizes = product.sizes.map(sObj => sObj.size.trim().toUpperCase());
        const requestedSize = size.trim().toUpperCase();

        if (!normalizedSizes.includes(requestedSize)) {
            console.error(`Size "${size}" is not available for product:`, productId);
            return res.status(400).json({ success: false, message: `Size "${size}" is not available for this product.` });
        }

        // Step 3: Create and save order with tracking info
        const newOrder = new Order({
            userId,
            orderId,
            amount: amount / 100,           // convert from paise to INR (or cents to currency unit)
            items: [
                {
                    productId,
                    name: product.name,
                    price: amount / 100,
                    quantity: 1,
                    size,
                },
            ],
            totalAmount: amount / 100,
            status: "Paid",
            paymentId,
            tracking: {
                paidAt: new Date(),
            },
            createdAt: new Date(),
        });

        await newOrder.save();

        console.log("Order created successfully:", newOrder);

        // Step 4: Send success response
        return res.status(200).json({ success: true, message: "Payment processed successfully.", order: newOrder });

    } catch (error) {
        console.error("Error verifying direct payment:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    } finally {
        console.log("=== Verify Direct Payment End ===");
    }
};

module.exports = { createOrder, verifyPayment, verifyDirectPayment };

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: [
        {
            productId: { type: String, required: true }, // Product ID
            name: { type: String, required: true },     // Product Name
            productType: { type: String },              // Product Type (e.g., Electronics, Apparel)
            price: { type: Number, required: true },    // Product Price
            quantity: { type: Number, required: true }, // Quantity of the product
            size: { type: String },                     // Size if applicable (e.g., M, L, XL)
            image: { type: String },                    // Image URL (optional for display purposes)
        },
    ],
    paymentId: { type: String, required: true }, // Razorpay Payment ID
    orderId: { type: String, required: true },   // Razorpay Order ID
    amount: { type: Number, required: true },    // Total Amount
    totalAmount: { type: Number },               // Optional: Grand Total (if applicable)
    status: { 
        type: String, 
        enum: ["Paid", "Processing", "Shipped", "Delivered", "Cancelled"], 
        default: "Paid" 
    },
    tracking: {
        paidAt: { type: Date },         // Date of payment
        processingAt: { type: Date },   // Date when processing started
        shippedAt: { type: Date },      // Date when shipped
        deliveredAt: { type: Date },    // Date of delivery
        cancelledAt: { type: Date },    // Date of cancellation
    },
    createdAt: { type: Date, default: Date.now }, // Order creation timestamp
});

module.exports = mongoose.model("Order", OrderSchema);

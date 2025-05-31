const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/productModel');
const FeaturedProduct = require('../models/featuredModel');
const router = express.Router();

// 1. View Cart
const viewCart = async (req, res) => {
    try {
        // Find the cart based on the userId
        const cart = await Cart.findOne({ userId: req.params.userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Populate product details conditionally
        const populatedItems = await Promise.all(
            cart.items.map(async (item) => {
                // Check the productType to determine whether to fetch from FeaturedProduct or Product
                let product;
                if (item.productType === 'Featured') {
                    product = await FeaturedProduct.findById(item.productId).select('name price image');
                } else if (item.productType === 'Product') {
                    product = await Product.findById(item.productId).select('name price image');
                }

                // Return the populated item with the necessary product details
                return {
                    ...item.toObject(),
                    product: product || {} // Add the populated product details to the cart item
                };
            })
        );

        // Set the populated items back to the cart object
        cart.items = populatedItems;

        // Return the populated cart data
        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const checkout = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    // Calculate total amount
    const amount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100; // in paise

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${new Date().getTime()}`,
    });

    // Create a temporary order entry in the database
    const order = new Order({
      userId,
      items: cart.items,
      amount,
      status: "Pending",
      razorpayOrderId: razorpayOrder.id,
    });

    await order.save();

    // Return order details and Razorpay order ID
    res.status(200).json({
      success: true,
      message: "Order created successfully.",
      orderId: razorpayOrder.id,
      amount,
    });
  } catch (err) {
    console.error("Error during checkout:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};


// 2. Add Product to Cart
const addProductToCart = async (req, res) => {
    const { productId, quantity, size } = req.body; // Accept size as part of the request

    try {
        console.log("Request Params:", req.params);
        console.log("Request Body:", req.body);

        // Find or create the user's cart
        let cart = await Cart.findOne({ userId: req.params.userId });
        console.log("Existing Cart:", cart);

        if (!cart) {
            cart = new Cart({ userId: req.params.userId, items: [] });
            console.log("New Cart Created:", cart);
        }

        // Fetch the product details
        const product = await Product.findById(productId);
        console.log("Fetched Product:", product);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Check if the product with the specified size already exists in the cart
        const existingItem = cart.items.find(item =>
            item.productId.toString() === productId &&
            (!size || item.size === size) // Match size if provided
        );
        console.log("Existing Item in Cart:", existingItem);

        if (existingItem) {
            // If product exists, update quantity
            existingItem.quantity += quantity;
            console.log("Updated Quantity:", existingItem.quantity);
        } else {
            // If product does not exist, add a new item
            cart.items.push({
                productId,
                productType: 'Product', // Specify the product type as 'Product'
                quantity,
                size: size || null, // Store size if provided
                name: product.name,
                price: product.price,
                image: product.singleImage,
            });
            console.log("New Item Added:", cart.items);
        }

        await cart.save();
        console.log("Cart Saved:", cart);

        res.status(200).json({
            success: true,
            message: 'Product added to cart successfully',
            cart,
        });
    } catch (err) {
        console.error("Error Adding Product to Cart:", err);
        res.status(500).json({
            success: false,
            message: 'An error occurred while adding the product to the cart',
            error: err.message,
        });
    }
};

// 3. Add Product to Featured Cart
const addProductToCartFeatured = async (req, res) => {
    const { productId, quantity, size } = req.body;  // added size here

    try {
        let cart = await Cart.findOne({ userId: req.params.userId });

        if (!cart) {
            cart = new Cart({ userId: req.params.userId, items: [] });
        }

        // Fetch the featured product details
        const product = await FeaturedProduct.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Featured product not found' });
        }

        // Check if the product with the same size already exists in the cart
        const existingItem = cart.items.find(item =>
            item.productId.toString() === productId.toString() && item.size === size
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId,
                productType: 'Featured', // Specify the product type
                quantity,
                size,  // store size here
                name: product.name,
                price: product.price,
                image: product.singleImage,
            });
        }

        await cart.save();
        res.status(200).json({ success: true, message: 'Featured product added to cart', cart });
    } catch (err) {
        res.status(500).json({ message: 'Error adding product to cart', error: err.message });
    }
};

// 4. Update Product Size in Cart
const updateProductSizeInCart = async (req, res) => {
    const { userId, productId } = req.params;
    const { size } = req.body;

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const item = cart.items.find(
            (item) => item.productId.toString() === productId
        );

        if (!item) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        item.size = size; // Update the size
        await cart.save();

        res.status(200).json({ success: true, cart });
    } catch (err) {
        console.error("Error updating size:", err);
        res.status(500).json({ message: "Error updating product size in cart" });
    }
};

// 5. Remove Product from Cart
const removeProductFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Remove the product from the cart
        cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);

        await cart.save();
        res.status(200).json({ message: 'Product removed from cart', cart });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 6. Update Product Quantity in Cart
const updateProductQuantityInCart = async (req, res) => {
    const { quantity } = req.body;

    try {
        const cart = await Cart.findOne({ userId: req.params.userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find the product in the cart
        const item = cart.items.find(item => item.productId.toString() === req.params.productId);

        if (!item) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Update the quantity of the product
        item.quantity = quantity;

        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 7. Clear Cart
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOneAndDelete({ userId: req.params.userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Export the functions and the router
module.exports = {
    viewCart,
    addProductToCart,
    removeProductFromCart,
    updateProductQuantityInCart,
    clearCart,
    addProductToCartFeatured,
    updateProductSizeInCart,
    checkout
};

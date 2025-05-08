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

// 2. Add Product to Cart
const addProductToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        console.log("Request Params:", req.params);
        console.log("Request Body:", req.body);

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

        // Check if the product already exists in the cart
        const existingItem = cart.items.find(item => item.productId.toString() === productId);
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

const addProductToCartFeatured = async (req, res) => {
    const { productId, quantity } = req.body;

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

        // Check if the product already exists in the cart
        const existingItem = cart.items.find(item => item.productId.toString() === productId.toString());
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId,
                productType: 'Featured', // Specify the product type
                quantity,
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

// 3. Remove Product from Cart
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

// 4. Update Product Quantity in Cart
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

// 5. Clear Cart
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
    addProductToCartFeatured
};

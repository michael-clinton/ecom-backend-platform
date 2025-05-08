const express = require('express');
const {
  viewCart,
  addProductToCart,
  removeProductFromCart,
  updateProductQuantityInCart,
  clearCart,
  addProductToCartFeatured
} = require('../controllers/cartController'); // Adjust the path based on your file structure

const router = express.Router();

// Define the routes and attach handlers
router.get('/:userId', viewCart); // View the cart for a specific user
router.post('/:userId', addProductToCart); // Add a product to the user's cart
router.delete('/:userId/:productId', removeProductFromCart); // Remove a product from the cart
router.put('/:userId/:productId', updateProductQuantityInCart); // Update product quantity in the cart
router.delete('/:userId', clearCart); // Clear the user's cart
router.post("/:userId/cart/featured", addProductToCartFeatured);

// Export the router
module.exports = router;

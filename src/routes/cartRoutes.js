const express = require("express");
const router = express.Router();
const {
  viewCart,
  addProductToCart,
  removeProductFromCart,
  updateProductQuantityInCart,
  clearCart,
  addProductToCartFeatured,
  updateProductSizeInCart,
  checkout
} = require("../controllers/cartController");

// View the cart for a specific user
router.get('/:userId', viewCart); 

// Add a product to the user's cart
router.post('/:userId', addProductToCart); 

// Remove a product from the cart
router.delete('/:userId/:productId', removeProductFromCart); 

// Update product quantity in the cart
router.put('/:userId/:productId/quantity', updateProductQuantityInCart);

// Clear the user's cart
router.delete('/:userId', clearCart);

// Add a product to the user's featured cart
router.post("/:userId/cart/featured", addProductToCartFeatured);

// Update the size of a product in the cart
router.put("/:userId/:productId/size", updateProductSizeInCart);

router.post("/:userId/checkout", checkout);

module.exports = router;

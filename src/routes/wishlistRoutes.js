const express = require("express");
const router = express.Router();
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkItemInWishlist,
  addWishlistItemToCart
} = require("../controllers/wishlistController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Add an item (Product or Featured) to the wishlist
router.post("/:userId",  addToWishlist);

// Remove an item (Product or Featured) from the wishlist
router.delete("/:userId/:itemId/:itemType",  removeFromWishlist);

// Check if an item is in the wishlist (POST route to check item presence)
router.post("/:userId/check",  checkItemInWishlist);

// Get user's wishlist with both Product and Featured items
router.get("/:userId",  getWishlist);

router.post("/:userId/cart",  addWishlistItemToCart);

module.exports = router;

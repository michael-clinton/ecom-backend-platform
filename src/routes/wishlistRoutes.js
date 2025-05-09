const express = require("express");
const router = express.Router();
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../controllers/wishlistController");

// Add an item (Product or Featured) to the wishlist
router.post("/:userId", addToWishlist);

// Remove an item (Product or Featured) from the wishlist
router.delete("/:userId/:itemId/:itemType", removeFromWishlist);

// Get user's wishlist with both Product and Featured items
router.get("/:userId", getWishlist);

module.exports = router;

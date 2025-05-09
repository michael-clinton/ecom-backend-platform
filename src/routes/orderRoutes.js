const express = require("express");
const router = express.Router();
const {
  getOrderHistory
} = require("../controllers/orderController");

// Routes for orders
router.get("/:userId/history", getOrderHistory); 

module.exports = router;

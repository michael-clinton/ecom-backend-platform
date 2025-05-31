const express = require("express");
const router = express.Router();
const {
  getOrderHistory, getOrderStatus, 
} = require("../controllers/orderController");

// Routes for orders
router.get("/:userId/history", getOrderHistory); 


router.get("/:orderId/status", getOrderStatus);


module.exports = router;

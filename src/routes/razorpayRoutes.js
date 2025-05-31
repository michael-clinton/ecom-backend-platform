const express = require("express");
const { createOrder, verifyPayment, verifyDirectPayment  } = require("../controllers/razorpayController");

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/verify-direct-payment", verifyDirectPayment);

module.exports = router;

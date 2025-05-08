const express = require("express");
const { getAllProducts, getProductById } = require("../controllers/productController");

const router = express.Router();

// Routes
router.get("/", getAllProducts); // Get all products
router.get("/:id", getProductById); // Get a single product by ID

module.exports = router;

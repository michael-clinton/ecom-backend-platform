const express = require("express");
const { getAllProducts, getProductById, getRelatedProducts, getProductsByCategorySlug, } = require("../controllers/productController");

const router = express.Router();

// Routes
router.get("/", getAllProducts); // Get all products
router.get("/:id", getProductById); // Get a single product by ID
router.get("/:type/:id/related", getRelatedProducts);
router.get("/category/:slug", getProductsByCategorySlug);

module.exports = router;

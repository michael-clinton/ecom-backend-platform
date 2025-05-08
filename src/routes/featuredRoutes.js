const express = require("express");
const { getAllFeaturedItems, getFeaturedById } = require("../controllers/featuredController");

const router = express.Router();

// Routes
router.get("/", getAllFeaturedItems); // Get all products
router.get("/:id", getFeaturedById); // Get a single product by ID

module.exports = router;

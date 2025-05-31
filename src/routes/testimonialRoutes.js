const express = require("express");
const Testimonial = require("../models/Testimonial");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;

const express = require("express");
const { getOffer } = require("../controllers/offerController");

const router = express.Router();

// Route to fetch the single offer
router.get("/offer-show", getOffer);

module.exports = router;
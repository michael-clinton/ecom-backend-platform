const Offer = require("../models/Offer");

// Fetch the single offer
const getOffer = async (req, res) => {
  try {
    const offer = await Offer.findOne();
    if (!offer) {
      return res.status(404).json({ message: "No offer found" });
    }
    res.status(200).json(offer);
  } catch (err) {
    console.error("Error fetching offer:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports = {
  getOffer,
};

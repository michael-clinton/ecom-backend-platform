const Featured = require("../models/featuredModel");

// Get all featured items
const getAllFeaturedItems = async (req, res) => {
  try {
    const featuredItems = await Featured.find();
    if (featuredItems.length === 0) {
      return res.status(404).json({ message: "No featured items found" });
    }
    res.status(200).json({ featuredItems });
  } catch (err) {
    console.error("Error fetching featured items:", err);
    res.status(500).json({ message: "Error fetching featured items", error: err.message });
  }
};

// Get a single featured item by ID
const getFeaturedById = async (req, res) => {
  try {
    const { id } = req.params;
    const featuredItem = await Featured.findById(id);
    if (!featuredItem) {
      return res.status(404).json({ message: "Featured item not found" });
    }
    res.status(200).json({ featuredItem });
  } catch (err) {
    console.error("Error fetching featured item:", err);
    res.status(500).json({ message: "Error fetching featured item", error: err.message });
  }
};

module.exports = {
  getAllFeaturedItems,
  getFeaturedById
};

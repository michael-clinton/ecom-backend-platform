const mongoose = require("mongoose");

const FeaturedSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, required: true },
    description: { type: String, required: true },
    singleImage: { type: String, required: true },
    multipleImages: { type: [String] },
});

const Featured = mongoose.model("Featured", FeaturedSchema);

module.exports = Featured;

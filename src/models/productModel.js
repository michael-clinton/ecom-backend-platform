const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  description: { type: String, required: true },
  singleImage: { type: String, required: true },
  multipleImages: [{ type: String }],
});

module.exports = mongoose.model("Product", productSchema);

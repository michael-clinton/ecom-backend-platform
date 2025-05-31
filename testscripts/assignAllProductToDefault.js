const mongoose = require("mongoose");
const Product = require("../src/models/productModel");
const Category = require("../src/models/Category");

async function assignAllProductsToDefaultCategory() {
  try {
    await mongoose.connect("mongodb://localhost:27017/reactbackend");

    const allCategory = await Category.findOne({ slug: "all" });
    if (!allCategory) {
      console.log("Default category 'All' not found.");
      process.exit(1);
    }

    const result = await Product.updateMany({}, { $set: { category: allCategory._id } });
    console.log(`Assigned ${result.modifiedCount} products to 'All' category.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

assignAllProductsToDefaultCategory();

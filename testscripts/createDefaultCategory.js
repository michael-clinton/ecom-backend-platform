const mongoose = require("mongoose");
const Category = require("../src/models/Category");

async function createDefaultCategory() {
  try {
    await mongoose.connect("mongodb://localhost:27017/reactbackend");

    let category = await Category.findOne({ slug: "all" });
    if (!category) {
      category = new Category({ name: "All", slug: "all" });  // Explicitly set slug here
      await category.save();
      console.log("Created default category: All");
    } else {
      console.log("Default category already exists");
    }
  } catch (error) {
    console.error("Error creating default category:", error);
  } finally {
    await mongoose.disconnect();
  }
}

createDefaultCategory();

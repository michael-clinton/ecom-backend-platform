const Product = require("../models/productModel");
const Featured = require("../models/featuredModel");
const Category = require("../models/Category");

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ product });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
};

const getProductsByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find category by slug
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Fetch products and populate category details
    const products = await Product.find({ category: category._id }).populate("category");

    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};

const getRelatedProducts = async (req, res) => {
  const { id, type } = req.params; // Expecting type to be either "product" or "featured"

  // Select the model based on the type provided in the URL
  const model = type === 'featured' ? Featured : Product;

  try {
    // Find the current product or featured item by ID
    const currentItem = await model.findById(id);

    if (!currentItem) {
      return res.status(404).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found.` });
    }

    // Find related products or featured items within a ±50 price range and exclude the current item
    const relatedItems = await model.find({
      _id: { $ne: id }, // Exclude the current item
      price: { $gte: currentItem.price - 50, $lte: currentItem.price + 50 },
    }).limit(8);

    // Send response with related items or an empty array if none found
    return res.json({ relatedItems });
  } catch (error) {
    console.error("Error fetching related items:", error);
    return res.status(500).json({ message: "Failed to fetch related items." });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  deleteProduct,
  getRelatedProducts,
  getProductsByCategorySlug,
};

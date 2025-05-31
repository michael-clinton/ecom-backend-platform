const mongoose = require("mongoose");
const Featured = require("../src/models/featuredModel"); // Adjust the path to your featuredModel file if needed

const addSizesToFeatured = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/reactbackend", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB.");

    // Fetch all featured products
    const featuredProducts = await Featured.find();

    const defaultSizes = [
      { size: "S", available: true },
      { size: "M", available: true },
      { size: "L", available: true },
      { size: "XL", available: true },
    ];

    for (const featured of featuredProducts) {
      featured.sizes = []; // Clear existing sizes
      featured.sizes = defaultSizes; // Add default sizes

      // Log the featured object to ensure the sizes field is updated
      console.log("Before save:", featured);

      await featured.save(); // Save the changes

      // Log after save to confirm the update
      console.log("After save:", featured);
    }

    console.log("Sizes updated for all featured products successfully.");
  } catch (error) {
    console.error("Error updating sizes:", error);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

addSizesToFeatured(); // Run the script

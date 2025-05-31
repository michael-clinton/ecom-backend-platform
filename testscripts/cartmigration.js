const mongoose = require('mongoose');
const Cart = require('../src/models/Cart'); // Adjust the path to your Cart model

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost:27017/reactbackend', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}).then(() => {
  console.log("Connected to the database successfully.");
}).catch((error) => {
  console.error("Error connecting to the database:", error);
  process.exit(1); // Exit the process if database connection fails
});

const migrateCartItems = async () => {
  try {
    console.log("Starting migration...");

    // Fetch all cart documents
    const carts = await Cart.find();

    // Iterate through each cart document
    for (const cart of carts) {
      let isModified = false; // Track whether the cart needs to be saved

      // Iterate through cart items
      for (const item of cart.items) {
        if (!item.size) {
          item.size = ''; // Add the `size` field with a default value if it doesn't exist
          isModified = true; // Mark cart as modified
        }
      }

      // Save the cart only if modifications were made
      if (isModified) {
        await cart.save(); // Save the cart document
        console.log(`Cart with userId ${cart.userId} updated.`);
      }
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from database.');
  }
};

// Execute the migration function
migrateCartItems();

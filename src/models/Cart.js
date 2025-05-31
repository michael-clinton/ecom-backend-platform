const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, refPath: 'productType', required: true },
  productType: { type: String, enum: ['Product', 'Featured'], required: true }, // Dynamically reference Product or FeaturedProduct
  quantity: { type: Number, default: 1 },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  size: { type: String, enum: ['S', 'M', 'L', 'XL'], default: '' }, // Added size field
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // This should be the user ID (can be the user’s auth token ID or username)
  items: [cartItemSchema],
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

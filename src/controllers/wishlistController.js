const Wishlist = require('../models/Wishlist');
const Product = require('../models/productModel');
const Featured = require('../models/featuredModel');
const Cart = require('../models/Cart');

// Add an item (Product or Featured) to the wishlist
const addToWishlist = async (req, res) => {
  const { userId } = req.params;
  const { itemId, itemType } = req.body;

  try {
    if (!['Product', 'Featured'].includes(itemType)) {
      return res.status(400).json({ message: 'Invalid item type' });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        items: [{ itemId, itemType }],
      });
      await wishlist.save();
      return res.status(201).json({ success: true, message: 'Item added to wishlist.' });
    }

    const itemExists = wishlist.items.some(
      (item) => item.itemId.toString() === itemId && item.itemType === itemType
    );

    if (itemExists) {
      return res.status(400).json({ message: 'Item already in wishlist.' });
    }

    wishlist.items.push({ itemId, itemType });
    await wishlist.save();
    res.status(200).json({ success: true, message: 'Item added to wishlist.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove an item (Product or Featured) from the wishlist
const removeFromWishlist = async (req, res) => {
  const { userId, itemId, itemType } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const itemIndex = wishlist.items.findIndex(
      (item) => item.itemId.toString() === itemId && item.itemType === itemType
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in wishlist.' });
    }

    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    res.status(200).json({ success: true, message: 'Item removed from wishlist.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found." });
    }

    const detailedItems = await Promise.all(
      wishlist.items.map(async (item) => {
        try {
          const itemDetails =
            item.itemType === "Product"
              ? await Product.findById(item.itemId)
              : await Featured.findById(item.itemId);

          return {
            ...item.toObject(),
            details: itemDetails || null, // Add item details or null if not found
          };
        } catch (error) {
          console.error(`Error fetching item details for ${item.itemId}:`, error);
          return { ...item.toObject(), details: null };
        }
      })
    );

    res.status(200).json({ wishlist: { items: detailedItems } });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const addWishlistItemToCart = async (req, res) => {
  const { userId } = req.params;
  const { productId, productType, quantity = 1, size } = req.body;

  try {
    // Validate product type and fetch the product
    const productModel = productType === 'Product' ? Product : Featured;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if the item already exists in the cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId && item.size === size
    );

    if (existingItem) {
      // Update quantity if the item already exists
      existingItem.quantity += quantity;
    } else {
      // Add new item to the cart
      cart.items.push({
        productId,
        productType,
        name: product.name,
        price: product.price,
        image: product.singleImage, // Use singleImage as the cart item image
        size,
        quantity,
      });
    }

    // Save changes to the cart
    await cart.save();

    res.status(200).json({ message: 'Item added to cart successfully', cart });
  } catch (error) {
    console.error('Error adding wishlist item to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const checkItemInWishlist = async (req, res) => {
  const { userId } = req.params;
  const { itemId, itemType } = req.body; // Expecting itemId and itemType in the request body

  try {
    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    // Check if the item exists in the wishlist
    const isItemInWishlist = wishlist.items.some(
      (item) => item.itemId.toString() === itemId && item.itemType === itemType
    );

    res.status(200).json({ success: true, isInWishlist: isItemInWishlist });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkItemInWishlist,
  addWishlistItemToCart
};

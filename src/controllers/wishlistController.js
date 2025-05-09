const Wishlist = require('../models/Wishlist');
const Product = require('../models/productModel');
const Featured = require('../models/featuredModel');

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

// Get the wishlist for a user with populated Product and Featured items
const getWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const populatedWishlist = await Wishlist.populate(wishlist, [
      { path: 'items.itemId', model: Product, match: { itemType: 'Product' } },
      { path: 'items.itemId', model: Featured, match: { itemType: 'Featured' } },
    ]);

    res.status(200).json({ success: true, wishlist: populatedWishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};

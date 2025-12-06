const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product'); // To populate product details
const auth = require('../middleware/auth'); // For user authentication

// @route   POST /api/wishlist
// @desc    Add a product to the user's wishlist
// @access  Private (Authenticated users only)
router.post('/', auth, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id; // Firebase UID from auth middleware

  try {
    // Check if product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if already in wishlist
    let wishlistItem = await Wishlist.findOne({ userId, productId });
    if (wishlistItem) {
      return res.status(400).json({ message: 'Product already in wishlist.' });
    }

    wishlistItem = new Wishlist({
      userId,
      productId,
    });

    await wishlistItem.save();
    res.status(201).json({ message: 'Product added to wishlist.', wishlistItem });
  } catch (err) {
    console.error('Error adding to wishlist:', err.message);
    if (err.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Product already in wishlist.' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove a product from the user's wishlist
// @access  Private (Authenticated users only)
router.delete('/:productId', auth, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id; // Firebase UID from auth middleware

  try {
    const wishlistItem = await Wishlist.findOneAndDelete({ userId, productId });

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Product not found in wishlist.' });
    }

    res.json({ message: 'Product removed from wishlist.' });
  } catch (err) {
    console.error('Error removing from wishlist:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/wishlist/user/:uid
// @desc    Get all wishlist items for a specific user
// @access  Private (User can view their own wishlist, Admin can view any user's wishlist)
router.get('/user/:uid', auth, async (req, res) => {
  const { uid } = req.params;

  // Ensure the authenticated user is requesting their own wishlist, or is an admin
  if (req.user.role !== 'admin' && req.user.id !== uid) {
    return res.status(403).json({ message: 'Unauthorized: You can only view your own wishlist.' });
  }

  try {
    const wishlist = await Wishlist.find({ userId: uid })
      .populate('productId', 'title price image category') // Populate with selected product details
      .sort({ createdAt: -1 });

    // Filter out null productId if a product was deleted but still in wishlist
    const filteredWishlist = wishlist.filter(item => item.productId !== null);

    res.json(filteredWishlist);
  } catch (err) {
    console.error('Error fetching user wishlist:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/wishlist/status/:productId
// @desc    Check if a specific product is in the user's wishlist
// @access  Private (Authenticated users only)
router.get('/status/:productId', auth, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const wishlistItem = await Wishlist.findOne({ userId, productId });
    res.json({ isWishlisted: !!wishlistItem });
  } catch (err) {
    console.error('Error checking wishlist status:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
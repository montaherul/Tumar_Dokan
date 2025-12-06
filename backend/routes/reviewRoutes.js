const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product'); // To check if product exists
const auth = require('../middleware/auth'); // For user authentication

// @route   POST /api/reviews
// @desc    Add a new review for a product
// @access  Private (Authenticated users only)
router.post('/', auth, async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id; // Firebase UID from auth middleware
  const userName = req.user.name; // User's name from auth middleware
  // userPhotoURL can be fetched from req.user if available in AuthContext sync

  try {
    // Check if product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    const newReview = new Review({
      productId,
      userId,
      userName,
      userPhotoURL: req.user.photoURL || '', // Assuming photoURL is available in req.user
      rating,
      comment,
    });

    const review = await newReview.save();
    res.status(201).json(review);
  } catch (err) {
    console.error('Error adding review:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a specific product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching product reviews:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Product ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/reviews/:reviewId/reply
// @desc    Add a reply to an existing review
// @access  Private (Authenticated users only)
router.post('/:reviewId/reply', auth, async (req, res) => {
  const { replyText } = req.body;
  const userId = req.user.id;
  const userName = req.user.name;
  const userPhotoURL = req.user.photoURL || '';

  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const newReply = {
      userId,
      userName,
      userPhotoURL,
      replyText,
      createdAt: new Date(),
    };

    review.replies.push(newReply);
    await review.save();

    res.status(201).json(review);
  } catch (err) {
    console.error('Error adding reply:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Review ID' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
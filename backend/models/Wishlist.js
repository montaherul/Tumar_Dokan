const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: String, // Firebase UID of the user
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
    ref: 'Product',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only wishlist a product once
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
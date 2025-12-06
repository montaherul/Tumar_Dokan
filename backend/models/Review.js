const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  userId: {
    type: String, // Firebase UID of the user who replied
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userPhotoURL: {
    type: String,
    default: '',
  },
  replyText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ReviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  userId: {
    type: String, // Firebase UID of the user who posted the review
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userPhotoURL: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  replies: [ReplySchema], // Array of replies
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only post one main review per product
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
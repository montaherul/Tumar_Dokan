const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discountPercentage: { // NEW: Discount percentage field
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String, // For simplicity, storing as string. Can be ref to Category model.
    required: true,
    trim: true,
  },
  image: {
    type: String, // URL to product image
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 1,
  },
  rating: { // Placeholder for rating, can be expanded later
    rate: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` field on save
ProductSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
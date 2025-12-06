const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String, // Firebase UID of the user who placed the order
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
    ref: 'Product',
    required: true,
  },
  productTitle: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
    required: true,
  },
  unitPrice: { // NEW: Price of a single unit at the time of order
    type: Number,
    required: true,
    min: 0,
  },
  orderedQuantity: { // NEW: Quantity of this product in this specific order
    type: Number,
    required: true,
    min: 1,
  },
  totalItemPrice: { // RENAMED from 'price': Total price for this item's quantity in the order
    type: Number,
    required: true,
    min: 0,
  },
  physicalAddress: {
    type: String,
    required: true,
  },
  mapEmbedLink: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'bKash', 'Nagad'],
    required: true,
  },
  transactionId: {
    type: String,
    default: null, // Required for bKash/Nagad, null for Cash on Delivery
  },
  senderNumber: {
    type: String,
    default: null, // Required for bKash/Nagad, null for Cash on Delivery
  },
  status: {
    type: String,
    enum: ['Payment Pending', 'Pending', 'Processing', 'Delivered', 'Cancelled'],
    default: 'Pending',
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
OrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // Needed to check product existence/stock
const auth = require('../middleware/auth'); // Firebase ID token verification
const adminAuth = require('../middleware/adminAuth'); // Admin role check

// @route   POST /api/orders
// @desc    Place a new order
// @access  Private (Authenticated users only)
router.post('/', auth, async (req, res) => {
  const {
    productId,
    productTitle,
    productImage,
    unitPrice, // NEW
    orderedQuantity, // NEW
    totalItemPrice, // NEW (replaces 'price')
    customerName,
    physicalAddress,
    mapEmbedLink,
    phone,
    paymentMethod,
    transactionId,
    senderNumber,
    status,
  } = req.body;

  // req.user is populated by the auth middleware with Firebase UID (req.user.id) and email
  const userId = req.user.id;
  const email = req.user.email;

  try {
    // Basic validation
    if (!productId || !productTitle || !productImage || unitPrice === undefined || orderedQuantity === undefined || totalItemPrice === undefined || !customerName || !physicalAddress || !phone || !paymentMethod) {
      return res.status(400).json({ message: 'Please provide all required order details including unit price, quantity, and total item price.' });
    }

    // Check if product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    if (product.stock < orderedQuantity) { // Check against orderedQuantity
      return res.status(400).json({ message: `Not enough stock for ${product.title}. Available: ${product.stock}` });
    }
    
    // Decrement stock by the ordered quantity
    product.stock -= orderedQuantity;
    await product.save();

    const newOrder = new Order({
      userId,
      email,
      customerName,
      productId,
      productTitle,
      productImage,
      unitPrice, // NEW
      orderedQuantity, // NEW
      totalItemPrice, // NEW
      physicalAddress,
      mapEmbedLink,
      phone,
      paymentMethod,
      transactionId: (paymentMethod === 'bKash' || paymentMethod === 'Nagad') ? transactionId : null,
      senderNumber: (paymentMethod === 'bKash' || paymentMethod === 'Nagad') ? senderNumber : null,
      status,
    });

    const order = await newOrder.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/orders/user/:uid
// @desc    Get all orders for a specific user
// @access  Private (User can view their own orders, Admin can view any user's orders)
router.get('/user/:uid', auth, async (req, res) => {
  const { uid } = req.params;

  // Ensure the authenticated user is requesting their own orders, or is an admin
  if (req.user.role !== 'admin' && req.user.id !== uid) {
    return res.status(403).json({ message: 'Unauthorized: You can only view your own orders.' });
  }

  try {
    const orders = await Order.find({ userId: uid }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/orders
// @desc    Get all orders (for admin dashboard)
// @access  Private (Admin only)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update the status of an order
// @access  Private (Admin only)
router.put('/:id/status', [auth, adminAuth], async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    let order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Validate new status
    const validStatuses = ['Payment Pending', 'Pending', 'Processing', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status provided.' });
    }

    order.status = status;
    order.updatedAt = Date.now(); // Manually update updatedAt
    await order.save();

    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Order ID' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
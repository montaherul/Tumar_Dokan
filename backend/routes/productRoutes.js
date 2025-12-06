const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/products
// @desc    Get all products, with optional category and search filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query; // Get category and search from query parameters
    let query = {};

    if (category && category !== 'All') { // Add category filter if provided and not 'All'
      query.category = category;
    }

    if (search) {
      // Use a regular expression for case-insensitive search on title and description
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query);
    console.log(`Fetched ${products.length} products from DB with filters.`); // Added console log
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') { // Handle invalid ObjectId format
      return res.status(400).json({ message: 'Invalid Product ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin only)
router.post('/', [auth, adminAuth], async (req, res) => {
  const { title, price, description, category, image, stock, discountPercentage } = req.body; // NEW: discountPercentage

  try {
    // Basic validation
    if (!title || !price || !description || !category || !image || !stock) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    // Generate a simple slug from the title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');

    const newProduct = new Product({
      title,
      slug,
      price,
      description,
      category,
      image,
      stock,
      discountPercentage: discountPercentage || 0, // NEW: Set discount, default to 0
    });

    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) { // Duplicate key error for slug
      return res.status(400).json({ message: 'Product with this title already exists (duplicate slug)' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Admin only)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  const { title, price, description, category, image, stock, discountPercentage } = req.body; // NEW: discountPercentage

  // Build product object
  const productFields = {};
  if (title) productFields.title = title;
  if (price !== undefined) productFields.price = price; // Allow 0 price
  if (description) productFields.description = description;
  if (category) productFields.category = category;
  if (image) productFields.image = image;
  if (stock !== undefined) productFields.stock = stock; // Allow 0 stock
  if (discountPercentage !== undefined) productFields.discountPercentage = discountPercentage; // NEW: Update discount
  if (title) productFields.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');


  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productFields },
      { new: true }
    );

    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Product ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Product ID' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
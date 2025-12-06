const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const fs = require('fs'); // Import file system module
const path = require('path'); // Import path module

// Load static products from products.json once when the module is loaded
let staticProducts = [];
try {
  const productsJsonPath = path.join(__dirname, '../products.json');
  const rawData = fs.readFileSync(productsJsonPath);
  const { products } = JSON.parse(rawData);
  staticProducts = products.map(p => ({
    _id: p.id.toString(), // Map id to _id as string for consistency with MongoDB
    title: p.title,
    slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
    price: p.price,
    discountPercentage: p.discountPercentage || 0,
    description: p.description,
    category: p.category,
    image: p.thumbnail || p.images[0], // Use thumbnail or first image
    stock: p.stock,
    rating: {
      rate: p.rating,
      count: p.reviews ? p.reviews.length : 0,
    },
    createdAt: new Date(p.meta.createdAt),
    updatedAt: new Date(p.meta.updatedAt),
  }));
  console.log('Loaded static products from products.json for fallback.');
} catch (err) {
  console.error('Error loading static products from products.json:', err.message);
}


// @route   GET /api/products
// @desc    Get all products, with optional category and search filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Attempt to fetch from MongoDB first
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
    res.json(products);
  } catch (err) {
    console.error('MongoDB query failed for /api/products, attempting fallback to static products:', err.message);
    // Check if it's a database connection error (MongooseServerSelectionError or MongoNetworkError)
    if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoNetworkError') {
      // Apply filters to static products
      let filteredStaticProducts = staticProducts;
      const { category, search } = req.query;
      if (category && category !== 'All') {
        filteredStaticProducts = filteredStaticProducts.filter(p => p.category === category);
      }
      if (search) {
        const lowerSearch = search.toLowerCase();
        filteredStaticProducts = filteredStaticProducts.filter(p =>
          p.title.toLowerCase().includes(lowerSearch) ||
          p.description.toLowerCase().includes(lowerSearch)
        );
      }
      return res.json(filteredStaticProducts);
    }
    // If not a database connection error, re-throw or send 500
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
    console.error('MongoDB query for single product failed, attempting fallback to static products:', err.message);
    // Check if it's a database connection error
    if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoNetworkError') {
      const product = staticProducts.find(p => p._id === req.params.id);
      if (product) {
        return res.json(product);
      } else {
        return res.status(404).json({ message: 'Product not found in static data' });
      }
    }
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
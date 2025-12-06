require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const redis = require('redis'); // Commented out Redis import
const fs = require('fs'); // Import file system module
const path = require('path'); // Import path module
const Product = require('./models/Product'); // Import Product model

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// --- MongoDB Connection ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    seedProducts(); // Call seeding function after successful connection
  })
  .catch(err => console.error('MongoDB connection error:', err));

// --- Redis Client (for future use) ---
// const redisClient = redis.createClient({ // Commented out Redis client initialization
//   url: process.env.REDIS_URL || 'redis://localhost:6379'
// });

// redisClient.on('error', (err) => console.error('Redis Client Error', err));
// redisClient.connect().then(() => console.log('Redis connected successfully')).catch(err => console.error('Redis connection error:', err));

// --- Middleware ---
app.use(cors({
  origin: 'http://localhost:5173', // Allow your React frontend to access
  credentials: true,
}));
app.use(express.json()); // For parsing application/json

// --- Routes ---
// This root route is fine, it just confirms the server is running.
app.get('/', (req, res) => {
  res.send('myproject Backend API is running!');
});

// Auth Routes (for custom backend auth, now primarily for token verification)
app.use('/api/auth', require('./routes/authRoutes'));
// Product Routes - Ensure this is correctly applied
app.use('/api/products', require('./routes/productRoutes'));
// User Routes - NEW!
app.use('/api/users', require('./routes/userRoutes'));
// Order Routes - NEW!
app.use('/api/orders', require('./routes/orderRoutes'));
// Wishlist Routes - NEW!
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
// Review Routes - NEW!
app.use('/api/reviews', require('./routes/reviewRoutes'));
// Cart Routes - NEW!
app.use('/api/cart', require('./routes/cartRoutes'));

// --- Product Seeding Function ---
async function seedProducts() {
  try {
    const productsJsonPath = path.join(__dirname, 'products.json');
    const rawData = fs.readFileSync(productsJsonPath);
    const { products } = JSON.parse(rawData);

    if (!products || products.length === 0) {
      console.log('No products found in products.json to seed.');
      return;
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) { // Only seed if the collection is empty
      console.log('No existing products found in DB. Seeding from products.json...');
      const productsToInsert = products.map(p => ({
        title: p.title,
        slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
        price: p.price,
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
      await Product.insertMany(productsToInsert);
      console.log(`Successfully seeded ${productsToInsert.length} products from products.json!`);
    } else {
      console.log(`Database already contains ${productCount} products. Skipping seeding from products.json.`);
    }
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
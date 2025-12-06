const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth'); // For user authentication

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private (Authenticated users only)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id; // Firebase UID from auth middleware
    // Populate with necessary product fields including discountPercentage
    let cart = await Cart.findOne({ userId }).populate('items.productId', 'title price image stock discountPercentage');

    if (!cart) {
      // If no cart exists, return an empty cart
      return res.json({ userId, items: [] });
    }
    res.json(cart);
  } catch (err) {
    console.error('Error fetching cart:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/cart
// @desc    Add item to cart or update quantity
// @access  Private (Authenticated users only)
router.post('/', auth, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Not enough stock for ${product.title}. Available: ${product.stock}` });
    }

    if (cart) {
      // Cart exists for user
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

      if (itemIndex > -1) {
        // Product exists in cart, update quantity
        const currentQuantity = cart.items[itemIndex].quantity;
        const newQuantity = currentQuantity + quantity;

        if (product.stock < newQuantity) {
          return res.status(400).json({ message: `Cannot add more. Only ${product.stock - currentQuantity} more of ${product.title} available.` });
        }
        cart.items[itemIndex].quantity = newQuantity;
      } else {
        // Product does not exist in cart, add new item
        cart.items.push({
          productId,
          productTitle: product.title,
          productImage: product.image,
          price: product.price, // Store original price, discount applied on frontend
          quantity,
        });
      }
      await cart.save();
      // Re-populate the cart before sending it back
      cart = await cart.populate('items.productId', 'title price image stock discountPercentage');
      res.json(cart);
    } else {
      // No cart for user, create new cart
      const newCart = new Cart({
        userId,
        items: [{
          productId,
          productTitle: product.title,
          productImage: product.image,
          price: product.price, // Store original price, discount applied on frontend
          quantity,
        }],
      });
      await newCart.save();
      // Populate the new cart before sending it back
      const populatedNewCart = await newCart.populate('items.productId', 'title price image stock discountPercentage');
      res.status(201).json(populatedNewCart);
    }
  } catch (err) {
    console.error('Error adding/updating cart item:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/cart/:productId
// @desc    Update quantity of an item in cart
// @access  Private (Authenticated users only)
router.put('/:productId', auth, async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user.' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
      if (product.stock < quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.title}. Available: ${product.stock}` });
      }

      cart.items[itemIndex].quantity = quantity;
      await cart.save();

      // IMPORTANT: Re-populate the cart before sending it back
      cart = await cart.populate('items.productId', 'title price image stock discountPercentage');
      res.json(cart);
    } else {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }
  } catch (err) {
    console.error('Error updating cart item quantity:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Private (Authenticated users only)
router.delete('/:productId', auth, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user.' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    // Re-populate the cart before sending it back
    cart = await cart.populate('items.productId', 'title price image stock discountPercentage');
    res.json(cart);
  } catch (err) {
    console.error('Error removing cart item:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear user's cart
// @access  Private (Authenticated users only)
router.delete('/clear', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If no cart exists, return an empty cart to confirm it's "cleared"
      return res.json({ message: 'Cart not found for this user, nothing to clear.', cart: { userId, items: [] } });
    }

    cart.items = []; // Clear all items
    await cart.save();
    // Re-populate the cart (even if empty, to maintain structure)
    cart = await cart.populate('items.productId', 'title price image stock discountPercentage');
    res.json({ message: 'Cart cleared successfully.', cart });
  } catch (err) {
    console.error('Error clearing cart:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
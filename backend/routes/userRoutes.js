const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth'); // Your existing auth middleware
const adminAuth = require('../middleware/adminAuth'); // Admin role check

// @route   POST /api/users
// @desc    Create or update user profile in MongoDB after Firebase auth
// @access  Private (requires Firebase ID token)
router.post('/', auth, async (req, res) => {
  const { uid, email, name, photoURL, phoneNumber } = req.body;

  try {
    // The 'auth' middleware already verified the token and attached req.user
    // We'll use the UID from the request body as the primary identifier for MongoDB
    // to link it to the Firebase user.
    let user = await User.findOne({ uid });

    if (user) {
      // Update existing user
      user.email = email || user.email;
      user.name = name || user.name;
      user.photoURL = photoURL || user.photoURL;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      // Do not update password here, as Firebase handles it.
      // If you want to update other fields, add them here.
      await user.save();
      return res.json({ message: 'User profile updated', user });
    } else {
      // Create new user
      user = new User({
        uid, // Store Firebase UID
        email,
        name,
        photoURL,
        phoneNumber,
        // Password is not stored directly here as Firebase handles it.
        // If you need a password field for other purposes, it should be optional
        // or generated/handled differently.
      });
      await user.save();
      return res.status(201).json({ message: 'User profile created', user });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/:uid
// @desc    Update specific user fields in MongoDB
// @access  Private (requires Firebase ID token and matching UID)
router.put('/:uid', auth, async (req, res) => {
  const { uid } = req.params;
  const { name, photoURL, phoneNumber } = req.body;

  // Ensure the authenticated user is updating their own profile
  if (req.user.id !== uid) { // req.user.id will be the Firebase UID from the token
    return res.status(403).json({ message: 'Unauthorized: You can only update your own profile.' });
  }

  try {
    let user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: 'User not found in database.' });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (photoURL !== undefined) user.photoURL = photoURL;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    await user.save();
    res.json({ message: 'User profile updated successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/:uid
// @desc    Get user profile by UID
// @access  Private (requires Firebase ID token and matching UID or admin role)
router.get('/:uid', auth, async (req, res) => {
  const { uid } = req.params;

  // Allow admin to view any profile, or user to view their own
  if (req.user.role !== 'admin' && req.user.id !== uid) {
    return res.status(403).json({ message: 'Unauthorized: You can only view your own profile or require admin access.' });
  }

  try {
    const user = await User.findOne({ uid }).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found in database.' });
    }
    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users
// @desc    Get all user profiles (Admin only)
// @access  Private (Admin only)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching all users:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/:uid/status
// @desc    Update user status (active/blocked) (Admin only)
// @access  Private (Admin only)
router.put('/:uid/status', [auth, adminAuth], async (req, res) => {
  const { uid } = req.params;
  const { status } = req.body; // 'active' or 'blocked'

  if (!['active', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided. Must be "active" or "blocked".' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { $set: { status, updatedAt: Date.now() } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: `User ${user.email} status updated to ${status}.`, user });
  } catch (err) {
    console.error('Error updating user status:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/:uid/role
// @desc    Update user role (user/admin) (Admin only)
// @access  Private (Admin only)
router.put('/:uid/role', [auth, adminAuth], async (req, res) => {
  const { uid } = req.params;
  const { role } = req.body; // 'user' or 'admin'

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided. Must be "user" or "admin".' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { $set: { role, updatedAt: Date.now() } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: `User ${user.email} role updated to ${role}.`, user });
  } catch (err) {
    console.error('Error updating user role:', err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
const express = require('express');
const router = express.Router();
// const bcrypt = require('bcryptjs'); // Not needed anymore
// const jwt = require('jsonwebtoken'); // Not needed anymore
// const User = require('../models/User'); // Not directly used for auth anymore

// Environment variable for JWT secret (no longer used for custom JWTs)
// const JWT_SECRET = process.env.JWT_SECRET;

// @route   POST /api/auth/register
// @desc    Register a new user (REMOVED - Firebase handles this)
// @access  Public
// router.post('/register', async (req, res) => {
//   const { email, password, name } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     user = new User({
//       email,
//       password,
//       name: name || 'User',
//     });

//     await user.save();

//     const payload = {
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//       },
//     };

//     jwt.sign(
//       payload,
//       JWT_SECRET,
//       { expiresIn: '1h' },
//       (err, token) => {
//         if (err) throw err;
//         res.status(201).json({ token, user: payload.user });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (REMOVED - Firebase handles this)
// @access  Public
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid Credentials' });
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid Credentials' });
//     }

//     const payload = {
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//       },
//     };

//     jwt.sign(
//       payload,
//       JWT_SECRET,
//       { expiresIn: '1h' },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token, user: payload.user });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// You might keep this file for other auth-related endpoints if needed,
// but for now, it's empty as login/register are handled by Firebase.

module.exports = router;
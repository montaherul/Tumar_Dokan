const admin = require('firebase-admin'); // Import Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.json'); // Path to your Firebase Admin SDK private key

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token'); // Expecting Firebase ID token here

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify Firebase ID token
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Fetch user from your MongoDB using the Firebase UID
    const User = require('../models/User'); // Import User model here to avoid circular dependency
    const mongoUser = await User.findOne({ uid: decodedToken.uid });

    if (!mongoUser) {
      // If user exists in Firebase but not in your DB, it's an issue or new user
      // For now, we'll allow access but mark as non-existent in DB
      req.user = {
        id: decodedToken.uid, // Firebase UID
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email,
        role: 'user', // Default role if not in DB
        // Add other Firebase claims if needed
      };
      console.warn(`Firebase user ${decodedToken.uid} authenticated but not found in MongoDB.`);
    } else {
      // User found in MongoDB, attach its details to the request
      req.user = {
        id: mongoUser.uid, // Firebase UID
        email: mongoUser.email,
        name: mongoUser.name,
        role: mongoUser.role,
        // Add other fields from your MongoDB user model as needed
      };
    }
    next();
  } catch (err) {
    console.error('Firebase ID token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid or expired' });
  }
};
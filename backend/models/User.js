const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); // Removed bcrypt as Firebase handles passwords

const UserSchema = new mongoose.Schema({
  uid: { // NEW: Firebase User ID
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  // password: { // Removed password field as Firebase handles authentication
  //   type: String,
  //   required: true,
  // },
  name: {
    type: String,
    default: 'User',
    trim: true,
  },
  photoURL: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  status: { // NEW: User status for blocking/unblocking
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
  },
  addresses: [
    {
      label: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Removed password hashing pre-save hook
// UserSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   next();
// });

// Removed method to compare passwords
// UserSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

module.exports = mongoose.model('User', UserSchema);
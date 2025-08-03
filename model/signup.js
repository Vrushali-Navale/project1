const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Prevent duplicate emails
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,  // Prevent duplicate usernames
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('signup', userSchema);

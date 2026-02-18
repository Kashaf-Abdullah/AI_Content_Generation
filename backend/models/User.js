
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, required: true, trim: true },
  isAdmin: { type: Boolean, default: false },
  subscription: { type: String, enum: ['free', 'pro'], default: 'free' },
  usageCount: { type: Number, default: 0 },
  dailyLimit: { type: Number, default: 5 },
  isVerified: { type: Boolean, default: false },
  createdPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  stripeCustomerId: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

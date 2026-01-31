// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email']
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: 6
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   isAdmin: {
//     type: Boolean,
//     default: false
//   },
//   subscription: {
//     type: String,
//     enum: ['free', 'pro'],
//     default: 'free'
//   },
//   usageCount: {
//     type: Number,
//     default: 0
//   },
//   dailyLimit: {
//     type: Number,
//     default: 5  // Free users
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   createdPosts: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Post'
//   }],
//   stripeCustomerId: String,
//   resetPasswordToken: String,
//   resetPasswordExpire: Date
// }, {
//   timestamps: true
// });

// // ✅ FIXED: Password hash - SYNC version (no next() issue)
// // Replace pre('save') with post-save (no next() needed)
// userSchema.post('save', async function(doc, next) {
//   if (this.isModified('password')) {
//     try {
//       const salt = await bcrypt.genSalt(12);
//       doc.password = await bcrypt.hash(doc.password, salt);
//       await doc.save();
//     } catch (error) {
//       next(error);
//     }
//   }
// });


// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);
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

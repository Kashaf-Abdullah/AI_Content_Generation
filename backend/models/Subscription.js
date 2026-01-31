const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    enum: ['pro-monthly', 'pro-yearly'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'past_due', 'canceled', 'incomplete'],
    default: 'active'
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAt: Date,
  canceledAt: Date,
  quantity: {
    type: Number,
    default: 1
  },
  priceId: String,  // stripe price id
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for quick lookup
// `userId` is already declared `unique: true` on the field and creates an index.
// Avoid creating a duplicate index which causes Mongoose to warn.
// subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  textInput: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    enum: ['instagram', 'whatsapp', 'linkedin', 'facebook'],
    required: true
  },
  tone: {
    type: String,
    enum: ['casual', 'professional', 'salesy', 'funny'],
    required: true
  },
  location: {
    type: String,
    enum: ['karachi', 'lahore', 'islamabad', 'hyderabad', 'peshawar'],
    default: 'karachi'
  },
  caption: {
    type: String,
    required: true
  },
  hashtags: [String],
  imageUrl: String,
  altText: String,
  scheduled: {
    type: Boolean,
    default: false
  },
  scheduledTime: Date,
  performance: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 }
  },
  aiPromptUsed: String,  // For debugging
  status: {
    type: String,
    enum: ['draft', 'generated', 'scheduled', 'posted'],
    default: 'generated'
  }
}, {
  timestamps: true
});

// Index for performance
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ platform: 1, location: 1 });

module.exports = mongoose.model('Post', postSchema);

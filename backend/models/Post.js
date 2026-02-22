// const mongoose = require('mongoose');

// const postSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   textInput: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   platform: {
//     type: String,
//     enum: ['instagram', 'whatsapp', 'linkedin', 'facebook'],
//     required: true
//   },
//   tone: {
//     type: String,
//     enum: ['casual', 'professional', 'salesy', 'funny'],
//     required: true
//   },
//   location: {
//     type: String,
//     enum: ['karachi', 'lahore', 'islamabad', 'hyderabad', 'peshawar'],
//     default: 'karachi'
//   },
//   caption: {
//     type: String,
//     required: true
//   },
//   hashtags: [String],
//   imageUrl: String,
//   altText: String,
//   scheduled: {
//     type: Boolean,
//     default: false
//   },
//   scheduledTime: Date,
//   performance: {
//     likes: { type: Number, default: 0 },
//     comments: { type: Number, default: 0 },
//     shares: { type: Number, default: 0 },
//     impressions: { type: Number, default: 0 }
//   },
//   aiPromptUsed: String,  // For debugging
//   status: {
//     type: String,
//     enum: ['draft', 'generated', 'scheduled', 'posted'],
//     default: 'generated'
//   }
// }, {
//   timestamps: true
// });

// // Index for performance
// postSchema.index({ userId: 1, createdAt: -1 });
// postSchema.index({ platform: 1, location: 1 });

// module.exports = mongoose.model('Post', postSchema);


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
    enum: ['instagram', 'whatsapp', 'linkedin', 'facebook', 'whatsapp_status'],
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
  
  // Scheduling fields
  scheduled: {
    type: Boolean,
    default: false
  },
  scheduledTime: {
    type: Date,
    index: true
  },
  repeatType: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  repeatEndDate: Date,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed', 'expired'],
    default: 'draft'
  },
  
  // For WhatsApp Status (24hr expiry)
  expiresAt: Date,
  isExpired: {
    type: Boolean,
    default: false
  },
  
  // Queue position
  queuePosition: {
    type: Number,
    default: 0
  },
  
  // Performance tracking
  performance: {
    views: { type: Number, default: 0 },
    replies: { type: Number, default: 0 }
  },
  
  aiPromptUsed: String,
  publishedAt: Date,
  errorLog: String
}, {
  timestamps: true
});

// Indexes for efficient queries
postSchema.index({ userId: 1, status: 1, scheduledTime: 1 });
postSchema.index({ userId: 1, platform: 1, status: 1 });
postSchema.index({ scheduledTime: 1, status: 1 }); // For cron jobs

module.exports = mongoose.model('Post', postSchema);
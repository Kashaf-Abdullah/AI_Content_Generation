const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // User notification preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    subscriptionUpdates: {
      type: Boolean,
      default: true
    },
    postGenerations: {
      type: Boolean,
      default: true
    },
    dailyLimitAlerts: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    adminAlerts: {
      type: Boolean,
      default: true
    }
  },
  // Sound settings
  sound: {
    enabled: {
      type: Boolean,
      default: true
    },
    soundFile: {
      type: String,
      default: 'default'
    }
  },
  // Do not disturb settings
  doNotDisturb: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String,
      default: '22:00'
    },
    endTime: {
      type: String,
      default: '08:00'
    }
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// No need for pre-save hook because timestamps: true handles it

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);
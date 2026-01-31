const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const postRoutes = require('./posts');
const subscriptionRoutes = require('./subscription');
const hashtagRoutes = require('./hashtags');
const adminRoutes = require('./admin');
// API Routes
router.use('/api/auth', authRoutes);
router.use('/api/posts', postRoutes);
router.use('/api/subscription', subscriptionRoutes);
router.use('/api/hashtags', hashtagRoutes);
router.use('/api/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;

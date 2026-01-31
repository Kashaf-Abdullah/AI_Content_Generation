const express = require('express');
const router = express.Router();
const { 
  createCheckoutSession, 
  webhook, 
  getSubscriptionStatus 
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Public webhook (Stripe calls this)
router.post('/webhook', webhook);

// Protected subscription routes
router.use(protect);
router.post('/create-session', createCheckoutSession);
router.get('/status', getSubscriptionStatus);

module.exports = router;

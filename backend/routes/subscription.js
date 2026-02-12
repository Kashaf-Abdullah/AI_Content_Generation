// const express = require('express');
// const router = express.Router();
// const { 
//   createCheckoutSession, 
//   webhook, 
//   getSubscriptionStatus,
//   checkSubscription 
// } = require('../controllers/subscriptionController');
// const { protect } = require('../middleware/auth');

// // Public webhook (Stripe calls this)
// router.post('/webhook', webhook);

// // Protected subscription routes
// router.use(protect);
// router.post('/create-session', createCheckoutSession);
// router.get('/status', getSubscriptionStatus);
// router.get('/check',  checkSubscription);
// module.exports = router;


const express = require('express');
const router = express.Router();
const { 
  createCheckoutSession, 
  verifyPayment,
  webhook, 
  getSubscriptionStatus,
  manualUpdate,
  cancelSubscription,
  debug,
  testConfig
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Public webhook (Stripe calls this - no authentication needed)
router.post('/webhook', webhook);

// Protected subscription routes
router.use(protect);

// Checkout and payment
router.post('/create-session', createCheckoutSession);
router.post('/verify-payment', verifyPayment);

// Subscription management
router.get('/status', getSubscriptionStatus);
router.post('/cancel', cancelSubscription);

// Debug and testing
router.post('/manual-update', manualUpdate);
router.get('/debug', debug);
router.get('/test-config', testConfig);

module.exports = router;
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not set — Stripe features are disabled.');
}
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// @desc    Create Stripe checkout session
// @route   POST /api/subscription/create-session
exports.createCheckoutSession = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Stripe is not configured on this server.' });
    }
    const user = await User.findById(req.user.id);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRO_PRICE_ID, // Your price ID from Stripe dashboard
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?cancel=true`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString()
      }
    });

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stripe webhook for subscription events
// @route   POST /api/subscription/webhook
exports.webhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  if (!stripe) {
    console.warn('Received webhook but Stripe is not configured.');
    return res.status(400).send('Stripe not configured');
  }

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.metadata.userId;
      
      const user = await User.findById(userId);
      user.subscription = 'pro';
      user.dailyLimit = 999; // Unlimited
      await user.save();
      
      // Create subscription record
      await Subscription.create({
        userId,
        stripeSubscriptionId: session.subscription,
        stripeCustomerId: session.customer,
        plan: 'pro-monthly',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      break;

    case 'customer.subscription.deleted':
      const subscriptionId = event.data.object.id;
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        { status: 'canceled' }
      );
      await User.findOneAndUpdate(
        { _id: event.data.object.metadata.userId },
        { subscription: 'free', dailyLimit: 5 }
      );
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// @desc    Get subscription status
// @route   GET /api/subscription/status
exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

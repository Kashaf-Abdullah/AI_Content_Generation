const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// @desc    Create Stripe checkout session
// @route   POST /api/subscription/create-session
// exports.createCheckoutSession = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price: process.env.STRIPE_PRO_PRICE_ID, // Your price ID from Stripe dashboard
//         quantity: 1,
//       }],
//       mode: 'subscription',
//       success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
//       cancel_url: `${process.env.FRONTEND_URL}/dashboard?cancel=true`,
//       customer_email: user.email,
//       metadata: {
//         userId: user._id.toString()
//       }
//     });

//     res.json({ success: true, sessionId: session.id });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.createCheckoutSession = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     // Check if user already has active subscription
//     const existingSubscription = await Subscription.findOne({ 
//       userId: user._id, 
//       status: 'active' 
//     });
    
//     if (existingSubscription) {
//       return res.status(400).json({ 
//         message: 'You already have an active subscription' 
//       });
//     }

//     // Validate Stripe configuration
//     if (!process.env.STRIPE_PRO_PRICE_ID) {
//       return res.status(500).json({ 
//         message: 'Stripe price ID not configured' 
//       });
//     }

//     if (!process.env.FRONTEND_URL) {
//       return res.status(500).json({ 
//         message: 'Frontend URL not configured' 
//       });
//     }

//     // Create Stripe checkout session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [{
//         price: process.env.STRIPE_PRO_PRICE_ID, // Your Stripe Price ID
//         quantity: 1,
//       }],
//       mode: 'subscription',
//       success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
//       cancel_url: `${process.env.FRONTEND_URL}/dashboard?cancel=true`,
//       customer_email: user.email,
//       metadata: {
//         userId: user._id.toString()
//       }
//     });

//     res.json({ 
//       success: true, 
//       sessionId: session.id,
//       url: session.url // Optional: Send session URL directly
//     });
//   } catch (error) {
//     console.error('Stripe checkout error:', error);
//     res.status(500).json({ 
//       message: error.message || 'Failed to create checkout session',
//       details: process.env.NODE_ENV === 'development' ? error : undefined
//     });
//   }
// };

exports.createCheckoutSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    console.log('=== Creating checkout session ===');
    
    // Check for existing active subscription
    const existingSub = await Subscription.findOne({
      userId: user._id,
      status: 'active'
    });
    
    if (existingSub) {
      console.log('User already has active subscription');
      return res.status(400).json({ 
        message: 'You already have an active Pro subscription' 
      });
    }
    
    // Create checkout session with return_url (for new Stripe.js)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRO_PRICE_ID, // Use your new price ID
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        userEmail: user.email,
        plan: 'pro_monthly'
      }
    });
    
    console.log('✅ Session created:', session.id);
    console.log('✅ Session URL:', session.url);
    
    // Return BOTH sessionId and url for compatibility
    res.json({
      success: true,
      sessionId: session.id,
      url: session.url, // IMPORTANT: This is the checkout URL
      message: 'Redirect to Stripe checkout'
    });
    
  } catch (error) {
    console.error('❌ Checkout error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        type: error.type,
        code: error.code
      } : undefined
    });
  }
};

// @desc    Stripe webhook for subscription events
// @route   POST /api/subscription/webhook
exports.webhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

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

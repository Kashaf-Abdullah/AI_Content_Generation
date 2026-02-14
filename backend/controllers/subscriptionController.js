

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { 
  createSubscriptionNotification, 
  createPaymentSuccessNotification 
} = require('./notificationController');
// @desc    Create Stripe checkout session
// @route   POST /api/subscription/create-session
exports.createCheckoutSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    console.log('=== Creating checkout session for:', user.email);

    // Check if user already has active subscription
    const existingSubscription = await Subscription.findOne({ 
      userId: user._id, 
      status: 'active' 
    });
    
    if (existingSubscription) {
      return res.status(400).json({ 
        success: false,
        message: 'You already have an active Pro subscription' 
      });
    }

    // Validate Stripe configuration
    if (!process.env.STRIPE_PRO_PRICE_ID) {
      console.error('❌ STRIPE_PRO_PRICE_ID not configured');
      return res.status(500).json({ 
        success: false,
        message: 'Payment configuration error. Please contact support.' 
      });
    }

    if (!process.env.FRONTEND_URL) {
      console.warn('⚠️ FRONTEND_URL not configured, using default');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${frontendUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        userEmail: user.email,
        plan: 'pro_monthly'
      }
    });

    console.log('✅ Checkout session created:', session.id);

    res.json({ 
      success: true, 
      sessionId: session.id,
      url: session.url,
      message: 'Redirect to Stripe checkout'
    });

  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    
    let errorMessage = 'Failed to create checkout session';
    let statusCode = 500;
    
    if (error.type === 'StripeInvalidRequestError') {
      if (error.code === 'resource_missing') {
        errorMessage = 'Payment configuration issue. Please contact support.';
      }
    }
    
    res.status(statusCode).json({ 
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify payment and update user
// @route   POST /api/subscription/verify-payment
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;
    
    console.log('🔍 Verifying payment for session:', sessionId);
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session ID is required' 
      });
    }

    // Retrieve session from Stripe with subscription details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });
    
    console.log('Session details:', {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      subscription: session.subscription?.id,
      metadata: session.metadata
    });

    // Verify session belongs to user
    if (session.metadata?.userId !== userId.toString()) {
      console.error('❌ Session user mismatch:', {
        sessionUserId: session.metadata?.userId,
        currentUserId: userId
      });
      return res.status(403).json({ 
        success: false, 
        message: 'This session does not belong to you' 
      });
    }

    // Check if payment was successful
    if (session.payment_status === 'paid' && session.status === 'complete') {
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      console.log(`✅ Payment verified for user: ${user.email}`);
      
      // Update user to pro
      user.subscription = 'pro';
      user.dailyLimit = 9999; // Unlimited
      await user.save();
      

      console.log(`✅ User ${user.email} upgraded to Pro`);
  // 🔔 CREATE PAYMENT SUCCESS NOTIFICATION
      await createPaymentSuccessNotification(user._id, {
        amount: '9.99',
        sessionId: session.id
      });

      // 🔔 CREATE SUBSCRIPTION UPGRADE NOTIFICATION
      await createSubscriptionNotification(user._id, {
        plan: 'pro-monthly',
        amount: '9.99'
      });

      // Create or update subscription record
      const subscriptionData = {
        userId: user._id,
        stripeSubscriptionId: session.subscription?.id,
        stripeCustomerId: session.customer,
        plan: 'pro-monthly',
        status: 'active',
        currentPeriodEnd: session.subscription ? 
          new Date(session.subscription.current_period_end * 1000) : 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priceId: process.env.STRIPE_PRO_PRICE_ID
      };

      const subscription = await Subscription.findOneAndUpdate(
        { userId: user._id },
        subscriptionData,
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true 
        }
      );

      console.log('✅ Subscription record updated:', subscription._id);

      return res.json({ 
        success: true, 
        message: 'Payment verified successfully! Your account has been upgraded to Pro.',
        user: {
          subscription: user.subscription,
          dailyLimit: user.dailyLimit,
          email: user.email
        },
        subscription: {
          status: subscription.status,
          plan: subscription.plan,
          currentPeriodEnd: subscription.currentPeriodEnd
        }
      });
    }

    // Payment not completed yet
    res.json({ 
      success: false, 
      message: 'Payment not completed yet',
      payment_status: session.payment_status,
      session_status: session.status
    });

  } catch (error) {
    console.error('❌ Verify payment error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Stripe webhook for subscription events
// @route   POST /api/subscription/webhook
exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log('🔔 Webhook received:', event.type);
    
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper function: Handle completed checkout
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('💰 Checkout session completed:', session.id);
    
    const userId = session.metadata?.userId;
    if (!userId) {
      console.error('❌ No userId in session metadata');
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return;
    }
    
    // Only update if payment was successful
    if (session.payment_status === 'paid') {
      // Update user to pro
      user.subscription = 'pro';
      user.dailyLimit = 9999;
      await user.save();
      
      console.log(`✅ User ${user.email} upgraded to Pro via webhook`);
        // 🔔 CREATE NOTIFICATIONS VIA WEBHOOK
      await createPaymentSuccessNotification(user._id, {
        amount: '9.99',
        sessionId: session.id
      });

      await createSubscriptionNotification(user._id, {
        plan: 'pro-monthly',
        amount: '9.99'
      });
      // Create or update subscription record
      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer,
          plan: 'pro-monthly',
          status: 'active',
          currentPeriodEnd: new Date(session.subscription_details?.current_period_end * 1000 || Date.now() + 30 * 24 * 60 * 60 * 1000),
          priceId: session.line_items?.data[0]?.price?.id || process.env.STRIPE_PRO_PRICE_ID
        },
        { upsert: true, new: true }
      );
    } else {
      console.log(`ℹ️ Session ${session.id} payment status: ${session.payment_status}`);
    }
    
  } catch (error) {
    console.error('❌ Error handling checkout session:', error);
  }
}

// Helper function: Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('📝 Subscription updated:', subscription.id);
    
    // Find subscription in database
    const subRecord = await Subscription.findOne({ 
      stripeSubscriptionId: subscription.id 
    });
    
    if (subRecord) {
      // Update subscription record
      subRecord.status = subscription.status;
      subRecord.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      subRecord.canceledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null;
      await subRecord.save();
      
      console.log(`✅ Subscription ${subscription.id} updated to status: ${subscription.status}`);
      
      // Update user if subscription is active
      if (subscription.status === 'active') {
        await User.findByIdAndUpdate(subRecord.userId, {
          subscription: 'pro',
          dailyLimit: 9999
        });
        console.log(`✅ User ${subRecord.userId} set to Pro`);
      } else if (subscription.status === 'canceled' || subscription.status === 'past_due') {
        // Downgrade user if subscription is canceled or past due
        await User.findByIdAndUpdate(subRecord.userId, {
          subscription: 'free',
          dailyLimit: 5
        });
        console.log(`⚠️ User ${subRecord.userId} downgraded to Free`);
      }
    } else {
      console.warn(`⚠️ Subscription ${subscription.id} not found in database`);
    }
    
  } catch (error) {
    console.error('❌ Error handling subscription update:', error);
  }
}

// Helper function: Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('🗑️ Subscription deleted:', subscription.id);
    
    const subRecord = await Subscription.findOne({ 
      stripeSubscriptionId: subscription.id 
    });
    
    if (subRecord) {
      // Mark subscription as canceled
      subRecord.status = 'canceled';
      subRecord.canceledAt = new Date();
      await subRecord.save();
      
      // Downgrade user to free
      await User.findByIdAndUpdate(subRecord.userId, {
        subscription: 'free',
        dailyLimit: 5
      });
      
      console.log(`✅ User ${subRecord.userId} downgraded to Free`);
    }
    
  } catch (error) {
    console.error('❌ Error handling subscription deletion:', error);
  }
}

// Helper function: Handle paid invoice
async function handleInvoicePaid(invoice) {
  try {
    console.log('🧾 Invoice paid:', invoice.id);
    
    // You can add additional logic here if needed
    // For example, send confirmation email, update accounting, etc.
    
  } catch (error) {
    console.error('❌ Error handling invoice paid:', error);
  }
}

// Helper function: Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  try {
    console.log('❌ Invoice payment failed:', invoice.id);
    
    // Find subscription and update status
    if (invoice.subscription) {
      const subRecord = await Subscription.findOne({ 
        stripeSubscriptionId: invoice.subscription 
      });
      
      if (subRecord) {
        subRecord.status = 'past_due';
        await subRecord.save();
        
        console.log(`⚠️ Subscription ${invoice.subscription} marked as past_due`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error handling invoice payment failed:', error);
  }
}

// @desc    Get subscription status for current user
// @route   GET /api/subscription/status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.user.id 
    }).select('-__v -createdAt -updatedAt');
    
    const user = await User.findById(req.user.id).select('subscription dailyLimit');
    
    res.json({ 
      success: true, 
      subscription: subscription,
      userSubscription: {
        plan: user.subscription,
        dailyLimit: user.dailyLimit,
        isPro: user.subscription === 'pro'
      }
    });
  } catch (error) {
    console.error('❌ Get subscription status error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Manually update subscription status (for testing)
// @route   POST /api/subscription/manual-update
exports.manualUpdate = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false,
        message: 'Session ID required' 
      });
    }
    
    console.log('🛠️ Manual update for session:', sessionId);
    
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });
    
    const userId = session.metadata?.userId || req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    if (session.payment_status === 'paid') {
      // Update user
      user.subscription = 'pro';
      user.dailyLimit = 9999;
      await user.save();
      
      // Create or update subscription record
      const subscription = await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          stripeSubscriptionId: session.subscription?.id,
          stripeCustomerId: session.customer,
          plan: 'pro-monthly',
          status: 'active',
          currentPeriodEnd: session.subscription ? 
            new Date(session.subscription.current_period_end * 1000) : 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        { upsert: true, new: true }
      );
      
      console.log(`✅ Manual update successful for ${user.email}`);
      
      return res.json({ 
        success: true, 
        message: 'User manually upgraded to Pro',
        user: {
          email: user.email,
          subscription: user.subscription,
          dailyLimit: user.dailyLimit
        },
        subscription: subscription
      });
    }
    
    res.status(400).json({ 
      success: false,
      message: 'Session not paid',
      payment_status: session.payment_status
    });
    
  } catch (error) {
    console.error('❌ Manual update error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscription/cancel
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.user.id,
      status: 'active'
    });
    
    if (!subscription) {
      return res.status(404).json({ 
        success: false,
        message: 'No active subscription found' 
      });
    }
    
    // Cancel subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(
      subscription.stripeSubscriptionId
    );
    
    // Update subscription record
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    await subscription.save();
    
    // Downgrade user
    await User.findByIdAndUpdate(req.user.id, {
      subscription: 'free',
      dailyLimit: 5
    });
    
    res.json({ 
      success: true, 
      message: 'Subscription canceled successfully',
      subscription: {
        status: canceledSubscription.status,
        canceledAt: canceledSubscription.canceled_at
      }
    });
    
  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Debug subscription info
// @route   GET /api/subscription/debug
exports.debug = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const subscription = await Subscription.findOne({ userId: user._id });
    
    const debugInfo = {
      user: {
        id: user._id,
        email: user.email,
        subscription: user.subscription,
        dailyLimit: user.dailyLimit,
        usageCount: user.usageCount
      },
      subscription: subscription,
      stripeConfig: {
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        frontendUrl: process.env.FRONTEND_URL
      },
      timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, debug: debugInfo });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Test Stripe configuration
// @route   GET /api/subscription/test-config
exports.testConfig = async (req, res) => {
  try {
    const config = {
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      priceIdConfigured: !!process.env.STRIPE_PRO_PRICE_ID,
      priceId: process.env.STRIPE_PRO_PRICE_ID,
      frontendUrl: process.env.FRONTEND_URL,
      webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    };
    
    // Test Stripe connection
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripeTest = require('stripe')(process.env.STRIPE_SECRET_KEY);
        await stripeTest.balance.retrieve();
        config.stripeConnection = '✅ Connected';
        
        // Test price retrieval
        if (process.env.STRIPE_PRO_PRICE_ID) {
          try {
            const price = await stripeTest.prices.retrieve(process.env.STRIPE_PRO_PRICE_ID);
            config.priceStatus = price.active ? '✅ Active' : '❌ Inactive';
            config.priceDetails = {
              amount: `$${price.unit_amount / 100} ${price.currency}`,
              interval: price.recurring?.interval,
              product: price.product
            };
          } catch (priceError) {
            config.priceStatus = `❌ Error: ${priceError.message}`;
          }
        }
      } catch (stripeError) {
        config.stripeConnection = `❌ Failed: ${stripeError.message}`;
      }
    }
    
    res.json({ success: true, config });
    
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
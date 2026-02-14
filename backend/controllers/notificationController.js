const Notification = require('../models/Notification');
const NotificationSettings = require('../models/NotificationSettings');
const User = require('../models/User');

// @desc    Get user notifications
// @route   GET /api/notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type, isRead } = req.query;

    let query = { userId: req.user.id };
    
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin notifications
// @route   GET /api/notifications/admin
exports.getAdminNotifications = async (req, res) => {
  try {
    // Get all admin users
    const admins = await User.find({ isAdmin: true }).select('_id');
    const adminIds = admins.map(admin => admin._id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      userId: { $in: adminIds },
      type: { $in: ['new_user_registered', 'admin_action', 'subscription_upgraded'] }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    const total = await Notification.countDocuments({
      userId: { $in: adminIds },
      type: { $in: ['new_user_registered', 'admin_action', 'subscription_upgraded'] }
    });

    const unreadCount = await Notification.countDocuments({
      userId: { $in: adminIds },
      isReadByAdmin: false,
      type: { $in: ['new_user_registered', 'admin_action', 'subscription_upgraded'] }
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.user.isAdmin) {
      notification.isReadByAdmin = true;
    } else {
      notification.isRead = true;
    }

    await notification.save();

    res.json({ 
      success: true, 
      message: 'Notification marked as read' 
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      await Notification.updateMany(
        { 
          userId: { $in: await getAdminIds() },
          isReadByAdmin: false 
        },
        { isReadByAdmin: true }
      );
    } else {
      await Notification.updateMany(
        { userId: req.user.id, isRead: false },
        { isRead: true }
      );
    }

    res.json({ 
      success: true, 
      message: 'All notifications marked as read' 
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await notification.deleteOne();

    res.json({ 
      success: true, 
      message: 'Notification deleted' 
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
exports.clearAllNotifications = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      await Notification.deleteMany({
        userId: { $in: await getAdminIds() },
        type: { $in: ['new_user_registered', 'admin_action', 'subscription_upgraded'] }
      });
    } else {
      await Notification.deleteMany({ userId: req.user.id });
    }

    res.json({ 
      success: true, 
      message: 'All notifications cleared' 
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notification settings
// @route   GET /api/notifications/settings
exports.getNotificationSettings = async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ userId: req.user.id });
    
    if (!settings) {
      // Create default settings if not exists
      settings = await NotificationSettings.create({
        userId: req.user.id,
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          subscriptionUpdates: true,
          postGenerations: true,
          dailyLimitAlerts: true,
          marketingEmails: false,
          adminAlerts: req.user.isAdmin || false
        }
      });
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update notification settings
// @route   PUT /api/notifications/settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    const { preferences, sound, doNotDisturb } = req.body;

    let settings = await NotificationSettings.findOne({ userId: req.user.id });
    
    if (!settings) {
      settings = new NotificationSettings({ userId: req.user.id });
    }

    if (preferences) {
      settings.preferences = {
        ...settings.preferences,
        ...preferences
      };
    }

    if (sound) {
      settings.sound = {
        ...settings.sound,
        ...sound
      };
    }

    if (doNotDisturb) {
      settings.doNotDisturb = {
        ...settings.doNotDisturb,
        ...doNotDisturb
      };
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Notification settings updated',
      settings
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get admin user IDs
async function getAdminIds() {
  const admins = await User.find({ isAdmin: true }).select('_id');
  return admins.map(admin => admin._id);
}

// ============ NOTIFICATION CREATION FUNCTIONS ============

// @desc    Create notification for subscription upgrade
exports.createSubscriptionNotification = async (userId, subscriptionData) => {
  try {
    const user = await User.findById(userId);
    const settings = await NotificationSettings.findOne({ userId });
    
    // Check if user has notifications enabled
    if (settings && !settings.preferences.subscriptionUpdates) {
      return;
    }

    // User notification
    await Notification.create({
      userId: user._id,
      type: 'subscription_upgraded',
      title: '🎉 Welcome to Pro!',
      message: 'Your account has been upgraded to Pro. Enjoy unlimited post generations!',
      priority: 'high',
      data: {
        plan: subscriptionData.plan,
        amount: subscriptionData.amount,
        date: new Date()
      }
    });

    // Admin notifications for all admins
    const admins = await User.find({ isAdmin: true });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        type: 'subscription_upgraded',
        title: '💰 New Pro Subscription',
        message: `${user.name} (${user.email}) upgraded to Pro plan`,
        priority: 'medium',
        data: {
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          plan: subscriptionData.plan,
          date: new Date()
        }
      });
    }

    console.log(`✅ Subscription notification created for user: ${user.email}`);
  } catch (error) {
    console.error('Create subscription notification error:', error);
  }
};

// @desc    Create notification for new user registration
exports.createNewUserNotification = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    // Welcome notification for new user
    await Notification.create({
      userId: user._id,
      type: 'welcome',
      title: '👋 Welcome to PostGen AI!',
      message: 'Start generating amazing posts with AI. You have 5 free posts daily.',
      priority: 'high',
      data: {
        dailyLimit: user.dailyLimit
      }
    });

    // Notify all admins about new user
    const admins = await User.find({ isAdmin: true });
    for (const admin of admins) {
      const adminSettings = await NotificationSettings.findOne({ userId: admin._id });
      
      if (adminSettings && !adminSettings.preferences.adminAlerts) {
        continue;
      }

      await Notification.create({
        userId: admin._id,
        type: 'new_user_registered',
        title: '👤 New User Registered',
        message: `${user.name} (${user.email}) joined PostGen AI`,
        priority: 'medium',
        data: {
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          joinDate: user.createdAt
        }
      });
    }

    console.log(`✅ New user notification created for: ${user.email}`);
  } catch (error) {
    console.error('Create new user notification error:', error);
  }
};

// @desc    Create notification for post generation
exports.createPostNotification = async (userId, postData) => {
  try {
    const user = await User.findById(userId);
    const settings = await NotificationSettings.findOne({ userId });
    
    // Check if user has post notifications enabled
    if (settings && !settings.preferences.postGenerations) {
      return;
    }

    await Notification.create({
      userId: user._id,
      type: 'post_generated',
      title: '✨ New Post Generated',
      message: `Your ${postData.platform} post has been generated successfully`,
      priority: 'low',
      data: {
        postId: postData._id,
        platform: postData.platform,
        tone: postData.tone,
        location: postData.location,
        caption: postData.caption?.substring(0, 100),
        date: new Date()
      }
    });

    console.log(`✅ Post notification created for user: ${user.email}`);
  } catch (error) {
    console.error('Create post notification error:', error);
  }
};

// @desc    Create notification for daily limit reached
exports.createLimitReachedNotification = async (userId) => {
  try {
    const user = await User.findById(userId);
    const settings = await NotificationSettings.findOne({ userId });
    
    // Check if user has limit alerts enabled
    if (settings && !settings.preferences.dailyLimitAlerts) {
      return;
    }

    await Notification.create({
      userId: user._id,
      type: 'daily_limit_reached',
      title: '⚠️ Daily Limit Reached',
      message: 'You have used all your free posts for today. Upgrade to Pro for unlimited posts!',
      priority: 'high',
      data: {
        usageCount: user.usageCount,
        dailyLimit: user.dailyLimit,
        date: new Date()
      }
    });

    console.log(`✅ Limit reached notification created for user: ${user.email}`);
  } catch (error) {
    console.error('Create limit reached notification error:', error);
  }
};

// @desc    Create notification for payment success
exports.createPaymentSuccessNotification = async (userId, paymentData) => {
  try {
    const user = await User.findById(userId);
    const settings = await NotificationSettings.findOne({ userId });
    
    // Check if user has subscription notifications enabled
    if (settings && !settings.preferences.subscriptionUpdates) {
      return;
    }

    await Notification.create({
      userId: user._id,
      type: 'payment_success',
      title: '💳 Payment Successful',
      message: `Your payment of $${paymentData.amount} has been processed successfully`,
      priority: 'high',
      data: {
        amount: paymentData.amount,
        sessionId: paymentData.sessionId,
        date: new Date()
      }
    });

    console.log(`✅ Payment success notification created for user: ${user.email}`);
  } catch (error) {
    console.error('Create payment success notification error:', error);
  }
};

// @desc    Create admin action notification
exports.createAdminActionNotification = async (adminId, action, targetUser, details) => {
  try {
    const admin = await User.findById(adminId);
    
    // Notify the target user about admin action
    if (targetUser) {
      await Notification.create({
        userId: targetUser._id,
        type: 'admin_action',
        title: '🔧 Account Update',
        message: details.message || `Your account has been ${action} by an administrator`,
        priority: 'high',
        data: {
          action,
          admin: admin.name,
          details,
          date: new Date()
        }
      });
    }

    // Notify other admins about the action
    const admins = await User.find({ isAdmin: true, _id: { $ne: adminId } });
    for (const otherAdmin of admins) {
      const adminSettings = await NotificationSettings.findOne({ userId: otherAdmin._id });
      
      if (adminSettings && !adminSettings.preferences.adminAlerts) {
        continue;
      }

      await Notification.create({
        userId: otherAdmin._id,
        type: 'admin_action',
        title: '🛠️ Admin Action',
        message: `${admin.name} ${action} ${targetUser ? targetUser.name : 'system settings'}`,
        priority: 'medium',
        data: {
          adminId: admin._id,
          adminName: admin.name,
          action,
          targetUser: targetUser ? {
            id: targetUser._id,
            name: targetUser.name,
            email: targetUser.email
          } : null,
          details,
          date: new Date()
        }
      });
    }

    console.log(`✅ Admin action notification created for: ${action}`);
  } catch (error) {
    console.error('Create admin action notification error:', error);
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: error.message });
  }
};
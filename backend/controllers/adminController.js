// const User = require('../models/User');
// const Post = require('../models/Post');
// const Subscription = require('../models/Subscription');

// // ✅ FIXED Admin Stats (No broken aggregation)
// exports.getAdminStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const proUsers = await User.countDocuments({ subscription: 'pro' });
//     const freeUsers = totalUsers - proUsers;
//     const totalPosts = await Post.countDocuments();

//     // ✅ SIMPLE revenue count (no complex $group)
//     const paidSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
//     res.json({
//       success: true,
//       stats: {
//         totalUsers,
//         proUsers,
//         freeUsers,
//         paidSubscriptions,
//         totalPosts,
//         activeUsersToday: totalUsers // Simplified
//       }
//     });
//   } catch (error) {
//     console.error('Admin stats error:', error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ✅ FIXED Revenue (Safe queries only)
// exports.getRevenue = async (req, res) => {
//   try {
//     const recentSubs = await Subscription.find({ status: 'active' })
//       .sort({ createdAt: -1 })
//       .limit(10)
//       .select('plan currentPeriodEnd');

//     res.json({ 
//       success: true, 
//       recentSubscriptions: recentSubs.length,
//       subscriptions: recentSubs 
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Revenue stats unavailable' });
//   }
// };

// // Other functions same...
// exports.getAllUsers = async (req, res) => {
//   const users = await User.find()
//     .select('name email subscription usageCount dailyLimit createdAt')
//     .sort({ createdAt: -1 })
//     .limit(50);
//   res.json({ success: true, users });
// };

// exports.getAllPosts = async (req, res) => {
//   const posts = await Post.find()
//     .populate('userId', 'name email')
//     .sort({ createdAt: -1 })
//     .limit(50);
//   res.json({ success: true, posts });
// };


// // @desc    Reset user limit (admin only)
// exports.resetUserLimit = async (req, res, next) => {
//   try {
//     const { userId } = req.params;
//     await User.findByIdAndUpdate(userId, { usageCount: 0 });
//     res.json({ success: true, message: 'User limit reset' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };



const User = require('../models/User');
const Post = require('../models/Post');
const Subscription = require('../models/Subscription');

// @desc    Get admin stats
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ subscription: 'pro' });
    const freeUsers = totalUsers - proUsers;
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const totalPosts = await Post.countDocuments();
    
    // Calculate total usage
    const users = await User.find({}, 'usageCount');
    const totalUsage = users.reduce((sum, user) => sum + (user.usageCount || 0), 0);
    const avgUsage = totalUsers > 0 ? Math.round(totalUsage / totalUsers) : 0;
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        proUsers,
        freeUsers,
        adminUsers,
        totalPosts,
        totalUsage,
        avgUsage,
        activeUsersToday: totalUsers
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with their stats
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email subscription usageCount dailyLimit isAdmin createdAt updatedAt')
      .sort({ createdAt: -1 });
    
    // Get post counts for each user
    const usersWithPostCounts = await Promise.all(users.map(async (user) => {
      const postCount = await Post.countDocuments({ userId: user._id });
      return {
        ...user.toObject(),
        postCount
      };
    }));
    
    res.json({ 
      success: true, 
      users: usersWithPostCounts 
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts
// @route   GET /api/admin/posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ 
      success: true, 
      posts 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get revenue stats
// @route   GET /api/admin/revenue
exports.getRevenue = async (req, res) => {
  try {
    const paidSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const recentSubs = await Subscription.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    res.json({ 
      success: true, 
      stats: {
        activeSubscriptions: paidSubscriptions,
        totalRevenue: paidSubscriptions * 9.99,
        estimatedMonthlyRevenue: paidSubscriptions * 9.99
      },
      recentSubscriptions: recentSubs
    });
  } catch (error) {
    res.status(500).json({ message: 'Revenue stats unavailable' });
  }
};

// @desc    Reset user limit
// @route   POST /api/admin/users/:userId/reset-limit
exports.resetUserLimit = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndUpdate(userId, { usageCount: 0 });
    res.json({ 
      success: true, 
      message: 'User limit reset successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle admin status
// @route   POST /api/admin/users/:userId/toggle-admin
exports.toggleAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isAdmin = isAdmin;
    await user.save();
    
    res.json({ 
      success: true, 
      message: `Admin status ${isAdmin ? 'granted' : 'revoked'}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle subscription plan
// @route   POST /api/admin/users/:userId/toggle-subscription
exports.toggleSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subscription } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.subscription = subscription;
    user.dailyLimit = subscription === 'pro' ? 9999 : 5;
    await user.save();
    
    // Update or create subscription record
    if (subscription === 'pro') {
      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          plan: 'pro-monthly',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        { upsert: true }
      );
    } else {
      await Subscription.findOneAndUpdate(
        { userId: user._id },
        { status: 'canceled' }
      );
    }
    
    res.json({ 
      success: true, 
      message: `User ${subscription === 'pro' ? 'upgraded to Pro' : 'downgraded to Free'}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        dailyLimit: user.dailyLimit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Don't allow deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ 
        message: 'Cannot delete your own account' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user's posts
    await Post.deleteMany({ userId: user._id });
    
    // Delete user's subscriptions
    await Subscription.deleteMany({ userId: user._id });
    
    // Delete user
    await user.deleteOne();
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:userId
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const postCount = await Post.countDocuments({ userId: user._id });
    const subscription = await Subscription.findOne({ userId: user._id });
    
    const recentPosts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        postCount,
        recentPosts,
        subscription
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
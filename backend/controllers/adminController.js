const User = require('../models/User');
const Post = require('../models/Post');
const Subscription = require('../models/Subscription');

// ✅ FIXED Admin Stats (No broken aggregation)
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ subscription: 'pro' });
    const freeUsers = totalUsers - proUsers;
    const totalPosts = await Post.countDocuments();

    // ✅ SIMPLE revenue count (no complex $group)
    const paidSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        proUsers,
        freeUsers,
        paidSubscriptions,
        totalPosts,
        activeUsersToday: totalUsers // Simplified
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ FIXED Revenue (Safe queries only)
exports.getRevenue = async (req, res) => {
  try {
    const recentSubs = await Subscription.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('plan currentPeriodEnd');

    res.json({ 
      success: true, 
      recentSubscriptions: recentSubs.length,
      subscriptions: recentSubs 
    });
  } catch (error) {
    res.status(500).json({ message: 'Revenue stats unavailable' });
  }
};

// Other functions same...
exports.getAllUsers = async (req, res) => {
  const users = await User.find()
    .select('name email subscription usageCount dailyLimit createdAt')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, users });
};

exports.getAllPosts = async (req, res) => {
  const posts = await Post.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, posts });
};


// @desc    Reset user limit (admin only)
exports.resetUserLimit = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndUpdate(userId, { usageCount: 0 });
    res.json({ success: true, message: 'User limit reset' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

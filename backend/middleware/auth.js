const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect middleware
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Usage limit check (free users)
exports.checkUsageLimit = async (req, res, next) => {
  const user = req.user;
  
  if (user.subscription === 'pro') return next();
  
  if (user.usageCount >= user.dailyLimit) {
    return res.status(403).json({
      message: 'Daily limit reached',
      used: user.usageCount,
      limit: user.dailyLimit,
      upgrade: true
    });
  }
  next();
};

// Admin only
exports.authorizeAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

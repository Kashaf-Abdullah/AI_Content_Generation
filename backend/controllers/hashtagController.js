const Hashtag = require('../models/Hashtag');

// @desc    Get trending hashtags by location
// @route   GET /api/hashtags/trending?location=karachi
exports.getTrendingHashtags = async (req, res, next) => {
  try {
    const { location } = req.query;
    
    const hashtags = await Hashtag.find({ location })
      .sort({ popularityScore: -1 })
      .limit(20)
      .select('tag popularityScore');

    res.json({ success: true, hashtags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update hashtag popularity (called by cron job)
exports.updateHashtagPopularity = async (req, res, next) => {
  // This would be called periodically with real social media data
  res.json({ success: true, message: 'Hashtags updated' });
};

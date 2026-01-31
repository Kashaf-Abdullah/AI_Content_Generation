const Post = require('../models/Post');
const User = require('../models/User');
const { generateCaption } = require('../utils/aiClient');

const PAKISTAN_HASHTAGS = {
  karachi: ['#KarachiEats', '#KarachiDeals', '#SindhBusiness', '#KarachiFoodies'],
  lahore: ['#LahoreFoodies', '#LahoreSales', '#PunjabBusiness'],
  hyderabad: ['#HyderabadEats', '#SindhDeals']
};

// @desc    Generate AI post
// @route   POST /api/posts/generate
exports.generatePost = async (req, res) => {
  try {
    const { textInput, platform, tone, location } = req.body;
    const userId = req.user.id;

    console.log('📝 Generating post:', { textInput, platform, tone, location });

    // Usage check
    const user = await User.findById(userId);
    if (user.subscription === 'free' && user.usageCount >= user.dailyLimit) {
      return res.status(403).json({ 
        message: 'Daily limit reached',
        usage: user.usageCount 
      });
    }

    // Use unified AI client (OpenAI or Gemini)
    let aiResponse;
    try {
      aiResponse = await generateCaption({ textInput, platform, tone, location });
    } catch (err) {
      console.error('AI client error:', err.message || err);
      // Fallback mock response
      aiResponse = {
        caption: `${textInput} ready in ${location}! 🔥`,
        hashtags: [`#${location.toUpperCase()}EATS`, '#PakistanDeals']
      };
    }

    // Save post
    const post = await Post.create({
      userId,
      textInput,
      platform,
      tone,
      location,
      caption: aiResponse.caption,
      hashtags: aiResponse.hashtags || []
    });

    user.usageCount += 1;
    await user.save();

    res.json({
      success: true,
      post: { 
        id: post._id, 
        caption: post.caption, 
        hashtags: post.hashtags.slice(0, 10) 
      }
    });

  } catch (error) {
    console.error('🚨 FULL ERROR:', {
      message: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack
    });

    // ✅ Graceful fallback
    if (error.status === 429 || error.code === 'insufficient_quota') {
      return res.status(503).json({ 
        message: 'AI service temporarily unavailable. Try again later.' 
      });
    }

    res.status(500).json({ 
      message: 'Post generation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
};

// @desc    Get user posts
// @route   GET /api/posts/history
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-aiPromptUsed');
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Post = require('../models/Post');
const schedulerService = require('../services/schedulerService');
const { createPostNotification } = require('./notificationController');

// @desc    Schedule a new post
// @route   POST /api/schedule
// @desc    Schedule a new post
// @route   POST /api/schedule
exports.schedulePost = async (req, res) => {
  try {
    // Handle both JSON and FormData
    let postData;
    
    if (req.is('multipart/form-data')) {
      // Handle FormData
      postData = {
        textInput: req.body.textInput,
        platform: req.body.platform,
        tone: req.body.tone,
        location: req.body.location,
        caption: req.body.caption,
        scheduledTime: req.body.scheduledTime,
        repeatType: req.body.repeatType || 'none',
        repeatEndDate: req.body.repeatEndDate || null,
        hashtags: req.body.hashtags ? JSON.parse(req.body.hashtags) : [],
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null
      };
    } else {
      postData = req.body;
    }

    const {
      textInput,
      platform,
      tone,
      location,
      caption,
      hashtags,
      scheduledTime,
      repeatType,
      repeatEndDate,
      imageUrl
    } = postData;

    // Validate required fields
    if (!caption) {
      return res.status(400).json({ 
        message: 'Caption is required' 
      });
    }

    if (!scheduledTime) {
      return res.status(400).json({ 
        message: 'Schedule time is required' 
      });
    }

    // Validate scheduling time
    const scheduleDate = new Date(scheduledTime);
    const now = new Date();
    
    // Add a small buffer (1 minute) to account for network delay
    const minValidTime = new Date(now.getTime() + 60000); // 1 minute from now
    
    if (scheduleDate < minValidTime) {
      return res.status(400).json({ 
        message: 'Schedule time must be at least 1 minute in the future' 
      });
    }

    // For WhatsApp Status, validate max days
    if (platform === 'whatsapp_status') {
      const maxStatusTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days max
      if (scheduleDate > maxStatusTime) {
        return res.status(400).json({ 
          message: 'WhatsApp Status cannot be scheduled more than 7 days in advance' 
        });
      }
    }

    // Check user's queue limit
    const scheduledCount = await Post.countDocuments({
      userId: req.user.id,
      status: 'scheduled'
    });

    const maxQueue = req.user.subscription === 'pro' ? 200 : 50;
    if (scheduledCount >= maxQueue) {
      return res.status(400).json({ 
        message: `Queue limit reached (max ${maxQueue} scheduled posts). Please wait for some to publish.` 
      });
    }

    // Create scheduled post
    const post = await Post.create({
      userId: req.user.id,
      textInput: textInput || caption,
      platform,
      tone: tone || 'casual',
      location: location || 'karachi',
      caption,
      hashtags: hashtags || [],
      imageUrl,
      scheduled: true,
      scheduledTime: scheduleDate,
      repeatType: repeatType || 'none',
      repeatEndDate: repeatEndDate ? new Date(repeatEndDate) : null,
      status: 'scheduled'
    });

    // Calculate queue position
    const queuePosition = await Post.countDocuments({
      userId: req.user.id,
      status: 'scheduled',
      scheduledTime: { $lt: scheduleDate }
    });
    
    post.queuePosition = queuePosition + 1;
    await post.save();

    // Create notification
    try {
      await createPostNotification(req.user.id, post);
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Post scheduled successfully',
      post: {
        id: post._id,
        caption: post.caption,
        scheduledTime: post.scheduledTime,
        queuePosition: post.queuePosition,
        repeatType: post.repeatType,
        platform: post.platform
      }
    });

  } catch (error) {
    console.error('Schedule post error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's scheduled posts
// @route   GET /api/schedule
exports.getScheduledPosts = async (req, res) => {
  try {
    const { status, platform, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };
    
    if (status) query.status = status;
    if (platform) query.platform = platform;

    const posts = await Post.find(query)
      .sort({ scheduledTime: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('caption platform scheduledTime repeatType status imageUrl createdAt publishedAt errorLog hashtags');

    const total = await Post.countDocuments(query);

    // Get queue stats
    let queueStats = null;
    try {
      queueStats = await schedulerService.getUserQueueStatus(req.user.id);
    } catch (err) {
      console.error('Queue stats error:', err);
    }

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      queue: queueStats
    });

  } catch (error) {
    console.error('Get scheduled posts error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update scheduled post
// @route   PUT /api/schedule/:postId
exports.updateScheduledPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption, scheduledTime, repeatType, repeatEndDate } = req.body;

    const post = await Post.findOne({
      _id: postId,
      userId: req.user.id,
      status: 'scheduled'
    });

    if (!post) {
      return res.status(404).json({ message: 'Scheduled post not found' });
    }

    // Validate new schedule time
    if (scheduledTime) {
      const newTime = new Date(scheduledTime);
      if (newTime < new Date()) {
        return res.status(400).json({ message: 'Schedule time must be in the future' });
      }
      post.scheduledTime = newTime;
    }

    if (caption) post.caption = caption;
    if (repeatType) post.repeatType = repeatType;
    if (repeatEndDate) post.repeatEndDate = new Date(repeatEndDate);

    await post.save();

    res.json({
      success: true,
      message: 'Scheduled post updated',
      post
    });

  } catch (error) {
    console.error('Update scheduled post error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel scheduled post
// @route   DELETE /api/schedule/:postId
exports.cancelScheduledPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findOneAndDelete({
      _id: postId,
      userId: req.user.id,
      status: 'scheduled'
    });

    if (!post) {
      return res.status(404).json({ message: 'Scheduled post not found' });
    }

    res.json({
      success: true,
      message: 'Scheduled post cancelled'
    });

  } catch (error) {
    console.error('Cancel scheduled post error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get queue status
// @route   GET /api/schedule/queue-status
exports.getQueueStatus = async (req, res) => {
  try {
    const queueStatus = await schedulerService.getUserQueueStatus(req.user.id);
    
    res.json({
      success: true,
      queue: queueStatus
    });

  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available time slots
// @route   GET /api/schedule/slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Reset time to start of day for comparison
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get current time for today's date comparison
    const now = new Date();

    // Get existing scheduled posts for this date
    const scheduledPosts = await Post.find({
      userId: req.user.id,
      status: 'scheduled',
      scheduledTime: { $gte: startOfDay, $lte: endOfDay }
    }).select('scheduledTime');

    // Generate available time slots (every 30 minutes)
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = new Date(targetDate);
        timeSlot.setHours(hour, minute, 0, 0);
        
        // Check if slot is in the past (for today)
        const isPast = targetDate.toDateString() === now.toDateString() && timeSlot <= now;
        
        // Check if slot is taken
        const isTaken = scheduledPosts.some(post => {
          const postTime = new Date(post.scheduledTime);
          return postTime.getHours() === hour && 
                 postTime.getMinutes() === minute;
        });

        if (!isPast && !isTaken) {
          slots.push({
            time: timeSlot.toISOString(),
            display: timeSlot.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true // This will show as 03:00 PM instead of 15:00
            }),
            available: true
          });
        }
      }
    }

    res.json({
      success: true,
      date: targetDate.toDateString(),
      slots: slots.slice(0, 48) // Max 48 slots per day
    });

  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ message: error.message });
  }
};
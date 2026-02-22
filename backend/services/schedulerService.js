const cron = require('node-cron');
const Post = require('../models/Post');
const User = require('../models/User');

class SchedulerService {
  constructor() {
    this.isRunning = false;
  }

  // Initialize the scheduler
  start() {
    if (this.isRunning) return;
    
    console.log('📅 Post Scheduler Started');
    this.isRunning = true;

    // Check for posts to publish every minute
    cron.schedule('* * * * *', async () => {
      await this.checkAndPublishPosts();
    });

    // Clean up expired WhatsApp statuses every hour
    cron.schedule('0 * * * *', async () => {
      await this.cleanupExpiredStatuses();
    });

    // Process repeat posts at midnight
    cron.schedule('0 0 * * *', async () => {
      await this.processRepeatPosts();
    });
  }

  // Check and publish scheduled posts
  async checkAndPublishPosts() {
    try {
      const now = new Date();
      
      // Find all scheduled posts that are due
      const postsToPublish = await Post.find({
        status: 'scheduled',
        scheduled: true,
        scheduledTime: { $lte: now },
        isExpired: false
      }).populate('userId');

      for (const post of postsToPublish) {
        await this.publishPost(post);
      }
    } catch (error) {
      console.error('Error checking scheduled posts:', error);
    }
  }

  // Publish a single post
  async publishPost(post) {
    try {
      console.log(`📤 Publishing post ${post._id} for user ${post.userId.email}`);

      // Here you would integrate with WhatsApp Business API
      // For now, we'll simulate the publishing
      
      // Update post status
      post.status = 'published';
      post.publishedAt = new Date();
      
      // For WhatsApp Status, set expiry to 24 hours
      if (post.platform === 'whatsapp_status') {
        post.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      
      await post.save();

      // Update user's usage count
      await User.findByIdAndUpdate(post.userId._id, {
        $inc: { usageCount: 1 }
      });

      console.log(`✅ Post ${post._id} published successfully`);

      // If this is a repeating post, create the next instance
      if (post.repeatType !== 'none') {
        await this.scheduleNextRepeat(post);
      }

    } catch (error) {
      console.error(`❌ Failed to publish post ${post._id}:`, error);
      
      post.status = 'failed';
      post.errorLog = error.message;
      await post.save();
    }
  }

  // Schedule next instance of a repeating post
  async scheduleNextRepeat(post) {
    try {
      // Don't schedule if repeat end date is passed
      if (post.repeatEndDate && new Date() > post.repeatEndDate) {
        return;
      }

      let nextTime = new Date(post.scheduledTime);
      
      switch (post.repeatType) {
        case 'daily':
          nextTime.setDate(nextTime.getDate() + 1);
          break;
        case 'weekly':
          nextTime.setDate(nextTime.getDate() + 7);
          break;
        case 'monthly':
          nextTime.setMonth(nextTime.getMonth() + 1);
          break;
        default:
          return;
      }

      // Check if next time is before repeat end date
      if (post.repeatEndDate && nextTime > post.repeatEndDate) {
        return;
      }

      // Create new scheduled post
      const newPost = new Post({
        ...post.toObject(),
        _id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        status: 'scheduled',
        scheduledTime: nextTime,
        publishedAt: undefined,
        expiresAt: undefined,
        isExpired: false,
        performance: { views: 0, replies: 0 }
      });

      await newPost.save();
      console.log(`🔄 Next repeat scheduled for ${nextTime}`);

    } catch (error) {
      console.error('Error scheduling next repeat:', error);
    }
  }

  // Clean up expired WhatsApp statuses
  async cleanupExpiredStatuses() {
    try {
      const now = new Date();
      
      const expiredPosts = await Post.updateMany(
        {
          platform: 'whatsapp_status',
          status: 'published',
          expiresAt: { $lte: now }
        },
        {
          isExpired: true,
          status: 'expired'
        }
      );

      if (expiredPosts.modifiedCount > 0) {
        console.log(`🧹 Cleaned up ${expiredPosts.modifiedCount} expired statuses`);
      }
    } catch (error) {
      console.error('Error cleaning up expired statuses:', error);
    }
  }

  // Process repeat posts (create daily/weekly instances)
  async processRepeatPosts() {
    try {
      // This is handled in publishPost for each published post
      // But we can also check for any missed repeats here
    } catch (error) {
      console.error('Error processing repeat posts:', error);
    }
  }

  // Get user's queue status
  async getUserQueueStatus(userId) {
    try {
      const scheduledCount = await Post.countDocuments({
        userId,
        status: 'scheduled',
        scheduledTime: { $gt: new Date() }
      });

      const publishedToday = await Post.countDocuments({
        userId,
        status: 'published',
        publishedAt: {
          $gte: new Date().setHours(0, 0, 0, 0)
        }
      });

      const queue = await Post.find({
        userId,
        status: 'scheduled'
      })
        .sort({ scheduledTime: 1 })
        .limit(10)
        .select('caption scheduledTime repeatType platform');

      return {
        scheduledCount,
        publishedToday,
        nextPost: queue[0] || null,
        queue
      };
    } catch (error) {
      console.error('Error getting queue status:', error);
      throw error;
    }
  }
}

module.exports = new SchedulerService();
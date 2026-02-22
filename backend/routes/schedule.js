const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  schedulePost,
  getScheduledPosts,
  updateScheduledPost,
  cancelScheduledPost,
  getQueueStatus,
  getAvailableSlots
} = require('../controllers/scheduleController');

// All routes require authentication
router.use(protect);

// Schedule routes
router.post('/', upload.single('image'), schedulePost);
router.get('/', getScheduledPosts);
router.get('/queue-status', getQueueStatus);
router.get('/slots', getAvailableSlots);
router.put('/:postId', updateScheduledPost);
router.delete('/:postId', cancelScheduledPost);

module.exports = router;
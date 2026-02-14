const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User notification routes
router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/clear-all', clearAllNotifications);

// Notification settings
router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);

// Admin only routes
router.get('/admin', authorizeAdmin, getAdminNotifications);

module.exports = router;
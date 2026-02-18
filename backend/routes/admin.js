

const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  getAllPosts,
  getRevenue,
  resetUserLimit,
  toggleAdmin,
  toggleSubscription,
  deleteUser,
  getUserDetails
} = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// All admin routes require admin access
router.use(protect, authorizeAdmin);

// Stats
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/posts', getAllPosts);
router.get('/revenue', getRevenue);

// User management
router.get('/users/:userId', getUserDetails);
router.post('/users/:userId/reset-limit', resetUserLimit);
router.post('/users/:userId/toggle-admin', toggleAdmin);
router.post('/users/:userId/toggle-subscription', toggleSubscription);
router.delete('/users/:userId', deleteUser);

module.exports = router;
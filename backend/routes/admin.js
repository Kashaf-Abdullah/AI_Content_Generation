const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  getAllPosts,
  getRevenue,
  resetUserLimit
} = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// All admin routes require admin access
router.use(protect, authorizeAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/posts', getAllPosts);
router.get('/revenue', getRevenue);
router.post('/users/:userId/reset-limit', resetUserLimit);

module.exports = router;

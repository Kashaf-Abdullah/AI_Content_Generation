const express = require('express');
const router = express.Router();
const { generatePost, getPosts } = require('../controllers/postController');
const { protect, checkUsageLimit } = require('../middleware/auth');

// Post routes - All protected
router.use(protect);
router.post('/generate', checkUsageLimit, generatePost);
router.get('/history', getPosts);

module.exports = router;

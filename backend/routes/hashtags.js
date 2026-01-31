const express = require('express');
const router = express.Router();
const { getTrendingHashtags } = require('../controllers/hashtagController');

// Public routes (no auth needed for hashtags)
router.get('/trending', getTrendingHashtags);

module.exports = router;

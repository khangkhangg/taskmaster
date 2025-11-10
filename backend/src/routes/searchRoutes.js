const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');
const searchController = require('../controllers/searchController');

// All search routes are rate-limited
router.use(searchLimiter);

// Advanced task search
router.get('/tasks', searchController.advancedTaskSearch);

// Advanced user search
router.get('/users', searchController.advancedUserSearch);

// Global search
router.get('/global', searchController.globalSearch);

// Search suggestions
router.get('/suggestions', searchController.getSearchSuggestions);

// Popular searches
router.get('/popular', searchController.getPopularSearches);

module.exports = router;

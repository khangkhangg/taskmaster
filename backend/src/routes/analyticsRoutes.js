const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// All analytics routes require authentication
router.use(auth);

router.get('/dashboard', analyticsController.getUserDashboard);
router.get('/task/:taskId', analyticsController.getTaskAnalytics);
router.get('/marketplace', analyticsController.getMarketplaceInsights);
router.get('/metrics', analyticsController.getUserMetrics);

module.exports = router;

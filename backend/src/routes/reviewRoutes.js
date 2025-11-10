const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

// All review routes require authentication
router.use(authenticate);

router.post('/', reviewController.createReview);
router.get('/user/:userId', reviewController.getUserReviews);
router.get('/task/:taskId', reviewController.getTaskReviews);
router.get('/trust-score/:userId', reviewController.getUserTrustScore);
router.post('/:reviewId/helpful', reviewController.markReviewHelpful);
router.post('/:reviewId/respond', reviewController.respondToReview);

module.exports = router;

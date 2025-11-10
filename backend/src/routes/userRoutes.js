const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// Public routes
router.get('/search', userController.searchUsers);
router.get('/:userId', userController.getUserProfile);
router.get('/:userId/followers', userController.getFollowers);
router.get('/:userId/following', userController.getFollowing);
router.get('/:userId/stats', userController.getUserStats);

// Protected routes
router.put('/profile', auth, userController.updateUserProfile);
router.post('/:userId/follow', auth, userController.followUser);
router.post('/:userId/unfollow', auth, userController.unfollowUser);
router.post('/tasks/:taskId/save', auth, userController.saveTask);
router.post('/tasks/:taskId/unsave', auth, userController.unsaveTask);
router.get('/saved/tasks', auth, userController.getSavedTasks);
router.get('/recommended/users', auth, userController.getRecommendedUsers);

module.exports = router;

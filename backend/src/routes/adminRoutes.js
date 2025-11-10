const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { isAdmin, isSuperAdmin } = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const taskModerationController = require('../controllers/taskModerationController');
const adminDisputeController = require('../controllers/adminDisputeController');
const adminStatsController = require('../controllers/adminStatsController');

// User Management Routes (Admin only)
router.get('/users', auth, isAdmin, adminController.getAllUsers);
router.get('/users/:userId', auth, isAdmin, adminController.getUserDetails);
router.post('/users/:userId/suspend', auth, isAdmin, adminController.suspendUser);
router.post('/users/:userId/unsuspend', auth, isAdmin, adminController.unsuspendUser);
router.post('/users/:userId/verify', auth, isAdmin, adminController.verifyUser);
router.post('/users/:userId/notes', auth, isAdmin, adminController.addModerationNote);

// User Role Management (Superadmin only)
router.post('/users/:userId/promote', auth, isSuperAdmin, adminController.promoteToAdmin);
router.post('/users/:userId/demote', auth, isSuperAdmin, adminController.demoteAdmin);
router.delete('/users/:userId', auth, isSuperAdmin, adminController.deleteUser);

// Task Moderation Routes (Admin only)
router.get('/tasks', auth, isAdmin, taskModerationController.getAllTasks);
router.get('/tasks/flagged', auth, isAdmin, taskModerationController.getFlaggedTasks);
router.get('/tasks/:taskId', auth, isAdmin, taskModerationController.getTaskDetails);
router.post('/tasks/:taskId/flag', auth, isAdmin, taskModerationController.flagTask);
router.post('/tasks/:taskId/unflag', auth, isAdmin, taskModerationController.unflagTask);
router.post('/tasks/:taskId/remove', auth, isAdmin, taskModerationController.removeTask);
router.post('/tasks/:taskId/notes', auth, isAdmin, taskModerationController.addTaskModerationNote);

// Dispute Resolution Routes (Admin only)
router.get('/disputes', auth, isAdmin, adminDisputeController.getAllDisputes);
router.get('/disputes/stats', auth, isAdmin, adminDisputeController.getDisputeStats);
router.get('/disputes/:disputeId', auth, isAdmin, adminDisputeController.getDisputeDetails);
router.post('/disputes/:disputeId/resolve', auth, isAdmin, adminDisputeController.resolveDispute);
router.post('/disputes/:disputeId/message', auth, isAdmin, adminDisputeController.addAdminMessage);
router.post('/disputes/:disputeId/priority', auth, isAdmin, adminDisputeController.setDisputePriority);
router.post('/disputes/:disputeId/close', auth, isAdmin, adminDisputeController.closeDispute);

// Platform Statistics Routes (Admin only)
router.get('/stats', auth, isAdmin, adminStatsController.getPlatformStats);
router.get('/stats/user-growth', auth, isAdmin, adminStatsController.getUserGrowth);
router.get('/stats/revenue', auth, isAdmin, adminStatsController.getRevenueTrends);
router.get('/stats/categories', auth, isAdmin, adminStatsController.getCategoryStats);
router.get('/stats/performers', auth, isAdmin, adminStatsController.getTopPerformers);
router.get('/stats/activity', auth, isAdmin, adminStatsController.getActivityReport);

module.exports = router;

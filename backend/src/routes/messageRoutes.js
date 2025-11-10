const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

// All message routes require authentication
router.use(authenticate);

router.post('/', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/task/:taskId', messageController.getTaskMessages);
router.put('/:messageId/read', messageController.markAsRead);

module.exports = router;

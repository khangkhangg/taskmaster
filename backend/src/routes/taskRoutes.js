const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

// All task routes require authentication
router.use(authenticate);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/my-tasks', taskController.getMyTasks);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/complete', taskController.completeTask);

module.exports = router;

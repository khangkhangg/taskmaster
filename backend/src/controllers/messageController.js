const Message = require('../models/Message');
const Task = require('../models/Task');
const { createNotification } = require('../utils/notifications');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { taskId, receiverId, message } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user is part of the task (poster or assigned doer)
    const isPoster = task.poster.toString() === req.userId.toString();
    const isDoer = task.assignedTo && task.assignedTo.toString() === req.userId.toString();

    if (!isPoster && !isDoer) {
      return res.status(403).json({ error: 'Not authorized to message on this task' });
    }

    // Create message
    const newMessage = new Message({
      task: taskId,
      sender: req.userId,
      receiver: receiverId,
      message,
      messageType: 'text'
    });

    await newMessage.save();

    await newMessage.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'receiver', select: 'name avatar' }
    ]);

    // Create notification for receiver
    await createNotification({
      user: receiverId,
      type: 'new_message',
      title: 'New Message',
      message: `${newMessage.sender.name} sent you a message`,
      data: {
        taskId,
        messageId: newMessage._id,
        userId: req.userId
      }
    });

    // Emit socket event (handled by socket.io)
    if (req.io) {
      req.io.to(receiverId.toString()).emit('new_message', newMessage);
    }

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages for a task
exports.getTaskMessages = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify user is part of the task
    const isPoster = task.poster.toString() === req.userId.toString();
    const isDoer = task.assignedTo && task.assignedTo.toString() === req.userId.toString();

    if (!isPoster && !isDoer) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ task: taskId })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({ task: taskId });

    // Mark messages as read
    await Message.updateMany(
      {
        task: taskId,
        receiver: req.userId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Oldest first
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get conversation list (tasks with messages)
exports.getConversations = async (req, res) => {
  try {
    // Find all tasks where user is involved
    const tasks = await Task.find({
      $or: [
        { poster: req.userId },
        { assignedTo: req.userId }
      ],
      status: { $in: ['in_progress', 'completed'] }
    })
      .populate('poster', 'name avatar')
      .populate('assignedTo', 'name avatar')
      .sort('-updatedAt');

    const conversations = [];

    for (const task of tasks) {
      // Get last message for this task
      const lastMessage = await Message.findOne({ task: task._id })
        .sort('-createdAt')
        .populate('sender', 'name avatar');

      // Get unread count
      const unreadCount = await Message.countDocuments({
        task: task._id,
        receiver: req.userId,
        read: false
      });

      // Determine other participant
      const otherParticipant = task.poster._id.toString() === req.userId.toString()
        ? task.assignedTo
        : task.poster;

      if (lastMessage || unreadCount > 0) {
        conversations.push({
          task: {
            _id: task._id,
            title: task.title,
            status: task.status
          },
          otherParticipant,
          lastMessage,
          unreadCount
        });
      }
    }

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.receiver.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

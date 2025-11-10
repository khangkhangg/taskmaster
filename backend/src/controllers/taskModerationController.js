const Task = require('../models/Task');
const User = require('../models/User');
const Bid = require('../models/Bid');

// Get all tasks for moderation with filtering
exports.getAllTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      flagged,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (flagged !== undefined) query.isFlagged = flagged === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const tasks = await Task.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('poster', 'name email avatar rating')
      .populate('assignedTo', 'name email avatar');

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get task details with full history
exports.getTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate('poster', 'name email avatar rating verification')
      .populate('assignedTo', 'name email avatar rating');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get all bids for this task
    const bids = await Bid.find({ task: taskId })
      .sort({ createdAt: -1 })
      .populate('bidder', 'name email avatar rating');

    res.json({
      task,
      bids
    });
  } catch (error) {
    console.error('Get task details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Flag task for review
exports.flagTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Flag reason is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.isFlagged = true;
    task.flagReason = reason;
    task.flaggedBy = req.userId;
    task.flaggedAt = new Date();

    if (!task.moderationNotes) {
      task.moderationNotes = [];
    }
    task.moderationNotes.push({
      note: `Task flagged: ${reason}`,
      addedBy: req.userId,
      createdAt: new Date()
    });

    await task.save();

    res.json({
      message: 'Task flagged successfully',
      task: {
        _id: task._id,
        title: task.title,
        isFlagged: task.isFlagged,
        flagReason: task.flagReason
      }
    });
  } catch (error) {
    console.error('Flag task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unflag task
exports.unflagTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.isFlagged = false;
    task.flagReason = undefined;
    task.flaggedBy = undefined;
    task.flaggedAt = undefined;

    if (!task.moderationNotes) {
      task.moderationNotes = [];
    }
    task.moderationNotes.push({
      note: 'Task flag cleared',
      addedBy: req.userId,
      createdAt: new Date()
    });

    await task.save();

    res.json({
      message: 'Task unflagged successfully',
      task: {
        _id: task._id,
        title: task.title,
        isFlagged: task.isFlagged
      }
    });
  } catch (error) {
    console.error('Unflag task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove task (admin delete)
exports.removeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Removal reason is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Can only remove if not in progress or completed
    if (task.status === 'in_progress' || task.status === 'completed') {
      return res.status(400).json({
        message: 'Cannot remove tasks that are in progress or completed'
      });
    }

    task.status = 'cancelled';
    task.isActive = false;
    task.removalReason = reason;
    task.removedBy = req.userId;
    task.removedAt = new Date();

    if (!task.moderationNotes) {
      task.moderationNotes = [];
    }
    task.moderationNotes.push({
      note: `Task removed by admin: ${reason}`,
      addedBy: req.userId,
      createdAt: new Date()
    });

    await task.save();

    res.json({
      message: 'Task removed successfully',
      task: {
        _id: task._id,
        title: task.title,
        status: task.status,
        isActive: task.isActive
      }
    });
  } catch (error) {
    console.error('Remove task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add moderation note to task
exports.addTaskModerationNote = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ message: 'Note is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.moderationNotes) {
      task.moderationNotes = [];
    }

    task.moderationNotes.push({
      note,
      addedBy: req.userId,
      createdAt: new Date()
    });

    await task.save();

    res.json({
      message: 'Moderation note added successfully',
      note: task.moderationNotes[task.moderationNotes.length - 1]
    });
  } catch (error) {
    console.error('Add task moderation note error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get flagged tasks
exports.getFlaggedTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20
    } = req.query;

    const skip = (page - 1) * limit;

    const tasks = await Task.find({ isFlagged: true })
      .sort({ flaggedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('poster', 'name email avatar')
      .populate('flaggedBy', 'name');

    const total = await Task.countDocuments({ isFlagged: true });

    res.json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get flagged tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;

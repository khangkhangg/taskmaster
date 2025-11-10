const Task = require('../models/Task');
const User = require('../models/User');
const { notifyTaskCompleted } = require('../utils/notifications');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      poster: req.userId
    });

    await task.save();

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.tasksPosted': 1 }
    });

    await task.populate('poster', 'name email avatar rating');

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tasks with filters
exports.getTasks = async (req, res) => {
  try {
    const {
      category,
      status,
      city,
      minBudget,
      maxBudget,
      locationType,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (locationType) query['location.type'] = locationType;
    if (minBudget) query['budget.min'] = { $gte: Number(minBudget) };
    if (maxBudget) query['budget.max'] = { $lte: Number(maxBudget) };

    const skip = (page - 1) * limit;

    const tasks = await Task.find(query)
      .populate('poster', 'name email avatar rating')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
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

// Get single task by ID
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('poster', 'name email avatar rating verification stats')
      .populate('assignedTo', 'name email avatar rating');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only poster can update
    if (task.poster.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    // Can't update if task is in progress or completed
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Cannot update task that is not open' });
    }

    const allowedUpdates = ['title', 'description', 'budget', 'location', 'deadline', 'images', 'requiredSkills'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    updates.forEach(update => task[update] = req.body[update]);
    await task.save();

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete/Cancel task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.poster.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    task.status = 'cancelled';
    await task.save();

    res.json({
      success: true,
      message: 'Task cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's posted tasks
exports.getMyTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { poster: req.userId };

    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name avatar rating')
      .sort('-createdAt');

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark task as complete
exports.completeTask = async (req, res) => {
  try {
    const { rating, comment, completionProof } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.poster.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (task.status !== 'in_progress') {
      return res.status(400).json({ error: 'Task is not in progress' });
    }

    task.status = 'completed';
    task.completionProof = completionProof || [];
    task.review = {
      rating,
      comment,
      createdAt: new Date()
    };

    await task.save();

    // Update assigned user's rating and stats
    if (task.assignedTo) {
      const assignedUser = await User.findById(task.assignedTo);
      if (assignedUser) {
        const newCount = assignedUser.rating.count + 1;
        const newAverage = ((assignedUser.rating.average * assignedUser.rating.count) + rating) / newCount;

        assignedUser.rating.average = newAverage;
        assignedUser.rating.count = newCount;
        assignedUser.stats.tasksCompleted += 1;

        await assignedUser.save();

        // Notify the task doer about completion
        await notifyTaskCompleted(task, assignedUser, task.poster);
      }
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const Bid = require('../models/Bid');
const Task = require('../models/Task');

// Create a bid
exports.createBid = async (req, res) => {
  try {
    const { taskId, amount, proposedTimeline, message } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Task is not accepting bids' });
    }

    if (task.poster.toString() === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot bid on your own task' });
    }

    // Check if user already has a bid on this task
    const existingBid = await Bid.findOne({ task: taskId, bidder: req.userId });
    if (existingBid) {
      return res.status(400).json({ error: 'You already have a bid on this task' });
    }

    const bid = new Bid({
      task: taskId,
      bidder: req.userId,
      amount,
      proposedTimeline,
      message,
      currency: task.budget.currency
    });

    await bid.save();

    // Update task bid count
    await Task.findByIdAndUpdate(taskId, {
      $inc: { bidsCount: 1 }
    });

    await bid.populate('bidder', 'name email avatar rating verification stats');

    res.status(201).json({
      success: true,
      data: bid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bids for a task
exports.getTaskBids = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Only task poster can see all bids
    if (task.poster.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to view bids' });
    }

    const bids = await Bid.find({ task: taskId })
      .populate('bidder', 'name email avatar rating verification stats')
      .sort('-createdAt');

    res.json({
      success: true,
      data: bids
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's bids
exports.getMyBids = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { bidder: req.userId };

    if (status) query.status = status;

    const bids = await Bid.find(query)
      .populate('task')
      .sort('-createdAt');

    res.json({
      success: true,
      data: bids
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update bid
exports.updateBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    if (bid.bidder.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot update bid that is not pending' });
    }

    const allowedUpdates = ['amount', 'proposedTimeline', 'message'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    updates.forEach(update => bid[update] = req.body[update]);
    await bid.save();

    res.json({
      success: true,
      data: bid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept a bid
exports.acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('task');

    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    const task = bid.task;

    if (task.poster.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Task is not open' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ error: 'Bid is not pending' });
    }

    // Accept the bid
    bid.status = 'accepted';
    await bid.save();

    // Update task
    task.status = 'in_progress';
    task.assignedTo = bid.bidder;
    task.selectedBid = bid._id;
    await task.save();

    // Reject all other bids
    await Bid.updateMany(
      { task: task._id, _id: { $ne: bid._id }, status: 'pending' },
      { status: 'rejected' }
    );

    res.json({
      success: true,
      data: bid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Withdraw bid
exports.withdrawBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    if (bid.bidder.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ error: 'Can only withdraw pending bids' });
    }

    bid.status = 'withdrawn';
    await bid.save();

    // Update task bid count
    await Task.findByIdAndUpdate(bid.task, {
      $inc: { bidsCount: -1 }
    });

    res.json({
      success: true,
      message: 'Bid withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

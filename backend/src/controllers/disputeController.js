const Dispute = require('../models/Dispute');
const Task = require('../models/Task');
const { notifyDisputeUpdate } = require('../utils/notifications');

// File a dispute
exports.createDispute = async (req, res) => {
  try {
    const { taskId, reason, description, evidence } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Determine who the dispute is against
    let filedAgainst;

    if (task.poster.toString() === req.userId.toString()) {
      // Poster filing against doer
      if (!task.assignedTo) {
        return res.status(400).json({ error: 'Task has no assigned doer' });
      }
      filedAgainst = task.assignedTo;
    } else if (task.assignedTo && task.assignedTo.toString() === req.userId.toString()) {
      // Doer filing against poster
      filedAgainst = task.poster;
    } else {
      return res.status(403).json({ error: 'Not authorized to dispute this task' });
    }

    // Check if dispute already exists
    const existingDispute = await Dispute.findOne({
      task: taskId,
      filedBy: req.userId,
      status: { $in: ['open', 'under_review'] }
    });

    if (existingDispute) {
      return res.status(400).json({ error: 'An active dispute already exists for this task' });
    }

    // Create dispute
    const dispute = new Dispute({
      task: taskId,
      filedBy: req.userId,
      filedAgainst,
      reason,
      description,
      evidence: evidence || []
    });

    await dispute.save();

    await dispute.populate([
      { path: 'task', select: 'title budget' },
      { path: 'filedBy', select: 'name email' },
      { path: 'filedAgainst', select: 'name email' }
    ]);

    // Notify the person the dispute is filed against
    await notifyDisputeUpdate(dispute, filedAgainst, 'A dispute has been filed against you');

    res.status(201).json({
      success: true,
      data: dispute
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's disputes
exports.getMyDisputes = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {
      $or: [
        { filedBy: req.userId },
        { filedAgainst: req.userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const disputes = await Dispute.find(query)
      .populate('task', 'title status')
      .populate('filedBy', 'name avatar')
      .populate('filedAgainst', 'name avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      data: disputes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single dispute
exports.getDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;

    const dispute = await Dispute.findById(disputeId)
      .populate('task')
      .populate('filedBy', 'name email avatar')
      .populate('filedAgainst', 'name email avatar')
      .populate('messages.sender', 'name avatar');

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    // Check authorization
    if (
      dispute.filedBy._id.toString() !== req.userId.toString() &&
      dispute.filedAgainst._id.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized to view this dispute' });
    }

    res.json({
      success: true,
      data: dispute
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add message to dispute
exports.addDisputeMessage = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { message } = req.body;

    const dispute = await Dispute.findById(disputeId);

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    // Check authorization
    if (
      dispute.filedBy.toString() !== req.userId.toString() &&
      dispute.filedAgainst.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    dispute.messages.push({
      sender: req.userId,
      message,
      isAdmin: false
    });

    await dispute.save();

    await dispute.populate('messages.sender', 'name avatar');

    // Notify the other party about the new message
    const otherParty = dispute.filedBy.toString() === req.userId.toString()
      ? dispute.filedAgainst
      : dispute.filedBy;

    await notifyDisputeUpdate(dispute, otherParty, 'New message in your dispute');

    res.json({
      success: true,
      data: dispute
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel/close dispute (by filer only)
exports.closeDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;

    const dispute = await Dispute.findById(disputeId);

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    if (dispute.filedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Only the dispute filer can close it' });
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      return res.status(400).json({ error: 'Dispute is already closed' });
    }

    dispute.status = 'closed';
    await dispute.save();

    res.json({
      success: true,
      message: 'Dispute closed',
      data: dispute
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin endpoints would go here (for Phase 7: Admin Dashboard)
// - Update dispute status
// - Resolve dispute
// - Add admin notes
// - Process refunds

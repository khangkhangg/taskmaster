const Dispute = require('../models/Dispute');
const Task = require('../models/Task');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get all disputes for admin review
exports.getAllDisputes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { reason: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const disputes = await Dispute.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('task', 'title budget status')
      .populate('complainant', 'name email avatar rating')
      .populate('defendant', 'name email avatar rating')
      .populate('resolvedBy', 'name');

    const total = await Dispute.countDocuments(query);

    res.json({
      disputes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all disputes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get dispute details
exports.getDisputeDetails = async (req, res) => {
  try {
    const { disputeId } = req.params;

    const dispute = await Dispute.findById(disputeId)
      .populate('task')
      .populate('complainant', 'name email avatar rating verification stats')
      .populate('defendant', 'name email avatar rating verification stats')
      .populate('resolvedBy', 'name')
      .populate('messages.sender', 'name avatar');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Get task poster to understand context
    const task = await Task.findById(dispute.task._id)
      .populate('poster', 'name email')
      .populate('assignedTo', 'name email');

    // Get transaction if exists
    let transaction = null;
    if (task) {
      transaction = await Transaction.findOne({ task: task._id });
    }

    res.json({
      dispute,
      taskDetails: task,
      transaction
    });
  } catch (error) {
    console.error('Get dispute details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Resolve dispute (admin decision)
exports.resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { resolution, refundPercentage, notes } = req.body;

    if (!resolution || !['complainant_favor', 'defendant_favor', 'partial_refund', 'no_action'].includes(resolution)) {
      return res.status(400).json({
        message: 'Invalid resolution. Must be: complainant_favor, defendant_favor, partial_refund, or no_action'
      });
    }

    const dispute = await Dispute.findById(disputeId)
      .populate('task')
      .populate('complainant')
      .populate('defendant');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      return res.status(400).json({ message: 'Dispute already resolved' });
    }

    // Update dispute
    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolvedBy = req.userId;
    dispute.resolvedAt = new Date();
    dispute.adminNotes = notes || '';

    // Handle financial resolution
    const transaction = await Transaction.findOne({ task: dispute.task._id });

    if (transaction && transaction.status === 'held') {
      switch (resolution) {
        case 'complainant_favor':
          // Full refund to task poster
          transaction.status = 'refunded';
          transaction.refundAmount = transaction.amount;
          break;

        case 'defendant_favor':
          // Full payment to task doer
          transaction.status = 'released';
          const defendant = await User.findById(dispute.defendant._id);
          if (defendant) {
            defendant.stats.totalEarned += transaction.payeeAmount;
            await defendant.save();
          }
          break;

        case 'partial_refund':
          // Partial refund based on percentage
          if (!refundPercentage || refundPercentage < 0 || refundPercentage > 100) {
            return res.status(400).json({ message: 'Invalid refund percentage (0-100)' });
          }
          const refundAmount = Math.round(transaction.amount * (refundPercentage / 100));
          const payeeAmount = transaction.amount - refundAmount;

          transaction.status = 'partial_refund';
          transaction.refundAmount = refundAmount;
          transaction.adjustedPayeeAmount = payeeAmount;

          // Update defendant earnings with partial amount
          const defendantPartial = await User.findById(dispute.defendant._id);
          if (defendantPartial) {
            defendantPartial.stats.totalEarned += payeeAmount;
            await defendantPartial.save();
          }
          break;

        case 'no_action':
          // Keep as is
          break;
      }

      transaction.timeline.push({
        status: transaction.status,
        note: `Admin resolved dispute: ${resolution}`,
        timestamp: new Date()
      });
      await transaction.save();
    }

    // Add resolution message to dispute
    dispute.messages.push({
      sender: req.userId,
      message: `Dispute resolved by admin: ${resolution}. ${notes || ''}`,
      isAdminMessage: true
    });

    await dispute.save();

    res.json({
      message: 'Dispute resolved successfully',
      dispute: {
        _id: dispute._id,
        status: dispute.status,
        resolution: dispute.resolution,
        resolvedAt: dispute.resolvedAt
      },
      transaction: transaction ? {
        _id: transaction._id,
        status: transaction.status,
        refundAmount: transaction.refundAmount
      } : null
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add admin message to dispute
exports.addAdminMessage = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    dispute.messages.push({
      sender: req.userId,
      message,
      isAdminMessage: true
    });

    await dispute.save();

    res.json({
      message: 'Admin message added successfully',
      messageData: dispute.messages[dispute.messages.length - 1]
    });
  } catch (error) {
    console.error('Add admin message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set dispute priority
exports.setDisputePriority = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { priority } = req.body;

    if (!priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority level' });
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    dispute.priority = priority;
    await dispute.save();

    res.json({
      message: 'Dispute priority updated successfully',
      dispute: {
        _id: dispute._id,
        priority: dispute.priority
      }
    });
  } catch (error) {
    console.error('Set dispute priority error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Close dispute
exports.closeDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { reason } = req.body;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    dispute.status = 'closed';
    dispute.closedBy = req.userId;
    dispute.closedAt = new Date();
    dispute.closeReason = reason || 'Closed by admin';

    dispute.messages.push({
      sender: req.userId,
      message: `Dispute closed: ${reason || 'Closed by admin'}`,
      isAdminMessage: true
    });

    await dispute.save();

    res.json({
      message: 'Dispute closed successfully',
      dispute: {
        _id: dispute._id,
        status: dispute.status,
        closedAt: dispute.closedAt
      }
    });
  } catch (error) {
    console.error('Close dispute error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get dispute statistics
exports.getDisputeStats = async (req, res) => {
  try {
    const totalDisputes = await Dispute.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: 'open' });
    const inReviewDisputes = await Dispute.countDocuments({ status: 'in_review' });
    const resolvedDisputes = await Dispute.countDocuments({ status: 'resolved' });
    const closedDisputes = await Dispute.countDocuments({ status: 'closed' });

    // Resolution breakdown
    const resolutionStats = await Dispute.aggregate([
      { $match: { status: 'resolved' } },
      { $group: { _id: '$resolution', count: { $sum: 1 } } }
    ]);

    // Priority breakdown
    const priorityStats = await Dispute.aggregate([
      { $match: { status: { $in: ['open', 'in_review'] } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Average resolution time
    const avgResolutionTime = await Dispute.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
      {
        $project: {
          resolutionTime: {
            $subtract: ['$resolvedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    res.json({
      total: totalDisputes,
      byStatus: {
        open: openDisputes,
        in_review: inReviewDisputes,
        resolved: resolvedDisputes,
        closed: closedDisputes
      },
      resolutions: resolutionStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      priorities: priorityStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      avgResolutionTimeHours: avgResolutionTime.length > 0
        ? Math.round(avgResolutionTime[0].avgTime / (1000 * 60 * 60))
        : 0
    });
  } catch (error) {
    console.error('Get dispute stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;

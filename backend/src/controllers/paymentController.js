const Transaction = require('../models/Transaction');
const Task = require('../models/Task');
const Bid = require('../models/Bid');
const User = require('../models/User');

// Create escrow payment when bid is accepted
exports.createEscrow = async (req, res) => {
  try {
    const { taskId, bidId, paymentMethod } = req.body;

    const task = await Task.findById(taskId);
    const bid = await Bid.findById(bidId);

    if (!task || !bid) {
      return res.status(404).json({ error: 'Task or bid not found' });
    }

    // Verify user is the task poster
    if (task.poster.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if escrow already exists
    const existingTransaction = await Transaction.findOne({
      task: taskId,
      type: 'escrow',
      status: { $in: ['pending', 'held'] }
    });

    if (existingTransaction) {
      return res.status(400).json({ error: 'Escrow payment already exists for this task' });
    }

    // Create escrow transaction
    const transaction = new Transaction({
      task: taskId,
      bid: bidId,
      payer: req.userId,
      payee: bid.bidder,
      amount: bid.amount,
      currency: bid.currency,
      type: 'escrow',
      status: 'pending',
      paymentMethod: paymentMethod || 'wallet',
      paymentProvider: 'internal'
    });

    await transaction.save();

    // Add timeline entry
    transaction.timeline.push({
      status: 'pending',
      timestamp: new Date(),
      note: 'Escrow payment initiated'
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Confirm escrow payment (hold funds)
exports.confirmEscrow = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate('task')
      .populate('payer', 'name email')
      .populate('payee', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.payer._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Transaction is not pending' });
    }

    // In a real app, this would integrate with payment provider
    // For now, we'll simulate successful payment
    transaction.status = 'held';
    transaction.providerTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await transaction.save();

    res.json({
      success: true,
      message: 'Funds held in escrow',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Release payment to task doer when task is completed
exports.releasePayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate('task')
      .populate('payer', 'name email')
      .populate('payee', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify user is the task poster
    if (transaction.payer._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (transaction.status !== 'held') {
      return res.status(400).json({ error: 'Funds are not held in escrow' });
    }

    // Verify task is completed
    if (transaction.task.status !== 'completed') {
      return res.status(400).json({ error: 'Task must be completed before releasing payment' });
    }

    // Release payment to task doer
    transaction.status = 'released';
    await transaction.save();

    // Update payee's total earned
    await User.findByIdAndUpdate(transaction.payee._id, {
      $inc: { 'stats.totalEarned': transaction.payeeAmount }
    });

    res.json({
      success: true,
      message: 'Payment released to task doer',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refund payment to task poster (if dispute resolved in favor of poster)
exports.refundPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    const transaction = await Transaction.findById(transactionId)
      .populate('task')
      .populate('payer', 'name email')
      .populate('payee', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'held') {
      return res.status(400).json({ error: 'Funds are not held in escrow' });
    }

    // Admin authorization would be required in production
    // For now, allowing task poster to initiate refund
    if (transaction.payer._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Refund payment
    transaction.status = 'refunded';
    transaction.notes = reason || 'Payment refunded';
    await transaction.save();

    res.json({
      success: true,
      message: 'Payment refunded to task poster',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transaction details
exports.getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate('task', 'title status')
      .populate('bid', 'amount')
      .populate('payer', 'name email avatar')
      .populate('payee', 'name email avatar');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check authorization
    if (
      transaction.payer._id.toString() !== req.userId.toString() &&
      transaction.payee._id.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    const query = {
      $or: [
        { payer: req.userId },
        { payee: req.userId }
      ]
    };

    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(query)
      .populate('task', 'title status')
      .populate('payer', 'name avatar')
      .populate('payee', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

    // Calculate totals
    const sent = await Transaction.aggregate([
      { $match: { payer: req.userId, status: 'released' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const received = await Transaction.aggregate([
      { $match: { payee: req.userId, status: 'released' } },
      { $group: { _id: null, total: { $sum: '$payeeAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          totalSent: sent.length > 0 ? sent[0].total : 0,
          totalReceived: received.length > 0 ? received[0].total : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get task transaction
exports.getTaskTransaction = async (req, res) => {
  try {
    const { taskId } = req.params;

    const transaction = await Transaction.findOne({ task: taskId })
      .populate('payer', 'name avatar')
      .populate('payee', 'name avatar');

    if (!transaction) {
      return res.status(404).json({ error: 'No transaction found for this task' });
    }

    // Check authorization
    if (
      transaction.payer._id.toString() !== req.userId.toString() &&
      transaction.payee._id.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const stats = {
      asPayerStats: {},
      asPayeeStats: {}
    };

    // Stats as payer
    const payerStats = await Transaction.aggregate([
      { $match: { payer: req.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    payerStats.forEach(stat => {
      stats.asPayerStats[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
    });

    // Stats as payee
    const payeeStats = await Transaction.aggregate([
      { $match: { payee: req.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payeeAmount' }
        }
      }
    ]);

    payeeStats.forEach(stat => {
      stats.asPayeeStats[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

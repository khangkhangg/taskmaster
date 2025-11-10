const User = require('../models/User');
const Task = require('../models/Task');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');

// Get comprehensive platform statistics
exports.getPlatformStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });
    const verifiedUsers = await User.countDocuments({ 'verification.identity': true });
    const adminUsers = await User.countDocuments({ accountType: { $in: ['admin', 'superadmin'] } });

    // Task statistics
    const totalTasks = await Task.countDocuments();
    const openTasks = await Task.countDocuments({ status: 'open' });
    const inProgressTasks = await Task.countDocuments({ status: 'in_progress' });
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const cancelledTasks = await Task.countDocuments({ status: 'cancelled' });
    const flaggedTasks = await Task.countDocuments({ isFlagged: true });

    // Bid statistics
    const totalBids = await Bid.countDocuments();
    const acceptedBids = await Bid.countDocuments({ status: 'accepted' });
    const rejectedBids = await Bid.countDocuments({ status: 'rejected' });

    // Financial statistics
    const financialStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$amount' },
          totalPlatformFees: { $sum: '$platformFee' },
          totalReleased: {
            $sum: {
              $cond: [{ $eq: ['$status', 'released'] }, '$amount', 0]
            }
          },
          totalRefunded: {
            $sum: {
              $cond: [{ $eq: ['$status', 'refunded'] }, '$amount', 0]
            }
          },
          totalInEscrow: {
            $sum: {
              $cond: [{ $eq: ['$status', 'held'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const financial = financialStats.length > 0 ? financialStats[0] : {
      totalVolume: 0,
      totalPlatformFees: 0,
      totalReleased: 0,
      totalRefunded: 0,
      totalInEscrow: 0
    };

    // Review statistics
    const totalReviews = await Review.countDocuments();
    const avgRating = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    // Dispute statistics
    const totalDisputes = await Dispute.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: 'open' });
    const resolvedDisputes = await Dispute.countDocuments({ status: 'resolved' });

    // Growth statistics (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers30d = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newTasks30d = await Task.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newBids30d = await Bid.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        verified: verifiedUsers,
        admins: adminUsers,
        new30d: newUsers30d
      },
      tasks: {
        total: totalTasks,
        open: openTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        cancelled: cancelledTasks,
        flagged: flaggedTasks,
        new30d: newTasks30d,
        completionRate: totalTasks > 0
          ? ((completedTasks / totalTasks) * 100).toFixed(2)
          : 0
      },
      bids: {
        total: totalBids,
        accepted: acceptedBids,
        rejected: rejectedBids,
        new30d: newBids30d,
        acceptanceRate: totalBids > 0
          ? ((acceptedBids / totalBids) * 100).toFixed(2)
          : 0
      },
      financial: {
        totalVolume: financial.totalVolume,
        totalPlatformFees: financial.totalPlatformFees,
        totalReleased: financial.totalReleased,
        totalRefunded: financial.totalRefunded,
        totalInEscrow: financial.totalInEscrow,
        currency: 'VND'
      },
      reviews: {
        total: totalReviews,
        averageRating: avgRating.length > 0
          ? avgRating[0].avgRating.toFixed(2)
          : 0
      },
      disputes: {
        total: totalDisputes,
        open: openDisputes,
        resolved: resolvedDisputes,
        resolutionRate: totalDisputes > 0
          ? ((resolvedDisputes / totalDisputes) * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user growth trends
exports.getUserGrowth = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    let groupBy;
    let dateRange;

    switch (period) {
      case 'day':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        dateRange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        break;
      case 'week':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        dateRange = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Last 90 days
        break;
      case 'month':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        dateRange = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Last year
        break;
      case 'year':
        groupBy = {
          year: { $year: '$createdAt' }
        };
        dateRange = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000); // Last 5 years
        break;
      default:
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        dateRange = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    }

    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: dateRange } } },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
    ]);

    res.json({ period, data: growth });
  } catch (error) {
    console.error('Get user growth error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get revenue trends
exports.getRevenueTrends = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let groupBy;
    let dateRange;

    switch (period) {
      case 'day':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        dateRange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'week':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        dateRange = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        dateRange = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        dateRange = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    }

    const revenue = await Transaction.aggregate([
      { $match: { createdAt: { $gte: dateRange }, status: 'released' } },
      {
        $group: {
          _id: groupBy,
          totalVolume: { $sum: '$amount' },
          platformFees: { $sum: '$platformFee' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
    ]);

    res.json({ period, data: revenue });
  } catch (error) {
    console.error('Get revenue trends error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get task category distribution
exports.getCategoryStats = async (req, res) => {
  try {
    const categoryStats = await Task.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgBudget: { $avg: { $avg: ['$budget.min', '$budget.max'] } }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ categories: categoryStats });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get top performers
exports.getTopPerformers = async (req, res) => {
  try {
    const { limit = 10, type = 'all' } = req.query;

    let topUsers = [];

    if (type === 'all' || type === 'earners') {
      // Top earners
      const topEarners = await User.find({ 'stats.totalEarned': { $gt: 0 } })
        .sort({ 'stats.totalEarned': -1 })
        .limit(parseInt(limit))
        .select('name avatar stats rating');

      topUsers.push({
        type: 'top_earners',
        users: topEarners
      });
    }

    if (type === 'all' || type === 'rated') {
      // Top rated users (minimum 5 reviews)
      const topRated = await User.find({
        'rating.count': { $gte: 5 }
      })
        .sort({ 'rating.average': -1 })
        .limit(parseInt(limit))
        .select('name avatar stats rating');

      topUsers.push({
        type: 'top_rated',
        users: topRated
      });
    }

    if (type === 'all' || type === 'active') {
      // Most active task posters
      const topPosters = await User.find({ 'stats.tasksPosted': { $gt: 0 } })
        .sort({ 'stats.tasksPosted': -1 })
        .limit(parseInt(limit))
        .select('name avatar stats rating');

      topUsers.push({
        type: 'top_posters',
        users: topPosters
      });
    }

    res.json({ performers: topUsers });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get activity report (recent activities for admin monitoring)
exports.getActivityReport = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const dateFrom = new Date(Date.now() - hours * 60 * 60 * 1000);

    const recentUsers = await User.find({ createdAt: { $gte: dateFrom } })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('name email createdAt');

    const recentTasks = await Task.find({ createdAt: { $gte: dateFrom } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('poster', 'name email')
      .select('title category budget status createdAt');

    const recentBids = await Bid.find({ createdAt: { $gte: dateFrom } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('bidder', 'name email')
      .populate('task', 'title')
      .select('amount status createdAt');

    const recentTransactions = await Transaction.find({ createdAt: { $gte: dateFrom } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('payer', 'name email')
      .populate('payee', 'name email')
      .select('amount status type createdAt');

    const recentDisputes = await Dispute.find({ createdAt: { $gte: dateFrom } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('complainant', 'name email')
      .populate('defendant', 'name email')
      .populate('task', 'title')
      .select('reason status priority createdAt');

    res.json({
      timeRange: `Last ${hours} hours`,
      activities: {
        newUsers: recentUsers,
        newTasks: recentTasks,
        newBids: recentBids,
        newTransactions: recentTransactions,
        newDisputes: recentDisputes
      }
    });
  } catch (error) {
    console.error('Get activity report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;

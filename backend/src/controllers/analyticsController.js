const Task = require('../models/Task');
const Bid = require('../models/Bid');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Review = require('../models/Review');

// Get user dashboard analytics
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    // Task statistics
    const taskStats = await Task.aggregate([
      { $match: { poster: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget.max' }
        }
      }
    ]);

    // Bid statistics
    const bidStats = await Bid.aggregate([
      { $match: { bidder: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent activities
    const recentTasks = await Task.find({ poster: userId })
      .sort('-createdAt')
      .limit(5)
      .select('title status createdAt bidsCount');

    const recentBids = await Bid.find({ bidder: userId })
      .sort('-createdAt')
      .limit(5)
      .populate('task', 'title status')
      .select('status amount createdAt');

    // Financial summary
    const transactions = await Transaction.aggregate([
      {
        $match: {
          $or: [{ payer: userId }, { payee: userId }]
        }
      },
      {
        $group: {
          _id: null,
          totalSent: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$payer', userId] }, { $eq: ['$status', 'released'] }] },
                '$amount',
                0
              ]
            }
          },
          totalReceived: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$payee', userId] }, { $eq: ['$status', 'released'] }] },
                '$payeeAmount',
                0
              ]
            }
          },
          inEscrow: {
            $sum: {
              $cond: [{ $eq: ['$status', 'held'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        taskStats: taskStats.reduce((acc, stat) => {
          acc[stat._id] = { count: stat.count, totalBudget: stat.totalBudget };
          return acc;
        }, {}),
        bidStats: bidStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        recentTasks,
        recentBids,
        financialSummary: transactions.length > 0 ? transactions[0] : {
          totalSent: 0,
          totalReceived: 0,
          inEscrow: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get task performance analytics
exports.getTaskAnalytics = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check authorization
    if (task.poster.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Bid analytics
    const bids = await Bid.find({ task: taskId });

    const bidAnalytics = {
      totalBids: bids.length,
      avgBidAmount: bids.length > 0
        ? bids.reduce((sum, bid) => sum + bid.amount, 0) / bids.length
        : 0,
      lowestBid: bids.length > 0
        ? Math.min(...bids.map(b => b.amount))
        : 0,
      highestBid: bids.length > 0
        ? Math.max(...bids.map(b => b.amount))
        : 0,
      acceptedBid: bids.find(b => b.status === 'accepted'),
      bidsByStatus: bids.reduce((acc, bid) => {
        acc[bid.status] = (acc[bid.status] || 0) + 1;
        return acc;
      }, {})
    };

    // Time analytics
    const now = new Date();
    const createdAt = new Date(task.createdAt);
    const daysSincePosted = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    let timeToFirstBid = null;
    if (bids.length > 0) {
      const firstBid = bids.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
      timeToFirstBid = Math.floor((new Date(firstBid.createdAt) - createdAt) / (1000 * 60));
    }

    const timeAnalytics = {
      daysSincePosted,
      timeToFirstBid: timeToFirstBid ? `${timeToFirstBid} minutes` : 'No bids yet',
      daysUntilDeadline: task.deadline
        ? Math.floor((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24))
        : null
    };

    res.json({
      success: true,
      data: {
        task: {
          title: task.title,
          status: task.status,
          budget: task.budget
        },
        bidAnalytics,
        timeAnalytics
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get marketplace insights
exports.getMarketplaceInsights = async (req, res) => {
  try {
    // Overall platform statistics
    const totalTasks = await Task.countDocuments();
    const activeTasks = await Task.countDocuments({ status: 'open' });
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const totalUsers = await User.countDocuments({ isActive: true });

    // Average task budget by category
    const avgBudgetByCategory = await Task.aggregate([
      { $match: { status: { $in: ['open', 'in_progress', 'completed'] } } },
      {
        $group: {
          _id: '$category',
          avgMin: { $avg: '$budget.min' },
          avgMax: { $avg: '$budget.max' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Popular cities
    const popularCities = await Task.aggregate([
      { $match: { 'location.city': { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$location.city',
          taskCount: { $sum: 1 }
        }
      },
      { $sort: { taskCount: -1 } },
      { $limit: 10 }
    ]);

    // Top rated users
    const topUsers = await User.find({ 'rating.count': { $gte: 5 } })
      .sort('-rating.average -rating.count')
      .limit(10)
      .select('name avatar rating stats');

    // Recent success rate
    const recentCompleted = await Task.countDocuments({
      status: 'completed',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const recentTotal = await Task.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const successRate = recentTotal > 0 ? (recentCompleted / recentTotal * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalTasks,
          activeTasks,
          completedTasks,
          totalUsers,
          successRate: `${successRate}%`
        },
        avgBudgetByCategory,
        popularCities,
        topUsers
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user performance metrics
exports.getUserMetrics = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Task completion rate
    const tasksPosted = await Task.countDocuments({ poster: userId });
    const tasksCompleted = await Task.countDocuments({
      poster: userId,
      status: 'completed'
    });
    const completionRate = tasksPosted > 0
      ? (tasksCompleted / tasksPosted * 100).toFixed(1)
      : 0;

    // Bid success rate (as bidder)
    const bidsPlaced = await Bid.countDocuments({ bidder: userId });
    const bidsAccepted = await Bid.countDocuments({
      bidder: userId,
      status: 'accepted'
    });
    const bidSuccessRate = bidsPlaced > 0
      ? (bidsAccepted / bidsPlaced * 100).toFixed(1)
      : 0;

    // Average response time (placeholder - would need message timing data)
    const responseTime = user.stats.responseTime || 120; // Default 2 hours

    // Earnings trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const earningsTrend = await Transaction.aggregate([
      {
        $match: {
          payee: userId,
          status: 'released',
          releasedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$releasedAt' },
            year: { $year: '$releasedAt' }
          },
          total: { $sum: '$payeeAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Review breakdown
    const reviews = await Review.find({ reviewee: userId });
    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        profile: {
          name: user.name,
          rating: user.rating,
          stats: user.stats
        },
        performance: {
          completionRate: `${completionRate}%`,
          bidSuccessRate: `${bidSuccessRate}%`,
          responseTime: `${responseTime} minutes`,
          responseRate: `${user.stats.responseRate}%`
        },
        earningsTrend,
        ratingDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

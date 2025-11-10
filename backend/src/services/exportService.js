const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const User = require('../models/User');
const Task = require('../models/Task');
const Bid = require('../models/Bid');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const Dispute = require('../models/Dispute');

// Ensure exports directory exists
const exportsDir = path.join(__dirname, '../../exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Export user data to JSON
const exportUserDataJSON = async (userId) => {
  try {
    // Get user data
    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      throw new Error('User not found');
    }

    // Get user's tasks
    const tasks = await Task.find({ poster: userId }).lean();

    // Get user's bids
    const bids = await Bid.find({ bidder: userId }).lean();

    // Get user's reviews
    const reviewsReceived = await Review.find({ reviewee: userId }).lean();
    const reviewsGiven = await Review.find({ reviewer: userId }).lean();

    // Get user's transactions
    const transactions = await Transaction.find({
      $or: [{ payer: userId }, { payee: userId }]
    }).lean();

    // Get user's disputes
    const disputes = await Dispute.find({
      $or: [{ filedBy: userId }, { filedAgainst: userId }]
    }).lean();

    // Compile export data
    const exportData = {
      user,
      tasks,
      bids,
      reviews: {
        received: reviewsReceived,
        given: reviewsGiven
      },
      transactions,
      disputes,
      exportDate: new Date().toISOString()
    };

    // Save to file
    const filename = `user_${userId}_export_${Date.now()}.json`;
    const filepath = path.join(exportsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    return {
      success: true,
      filename,
      filepath,
      size: fs.statSync(filepath).size
    };
  } catch (error) {
    console.error('Export user data JSON error:', error);
    return { success: false, error: error.message };
  }
};

// Export user data to CSV
const exportUserDataCSV = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      throw new Error('User not found');
    }

    const tasks = await Task.find({ poster: userId }).lean();
    const bids = await Bid.find({ bidder: userId }).lean();
    const transactions = await Transaction.find({
      $or: [{ payer: userId }, { payee: userId }]
    }).lean();

    // Convert to CSV
    const tasksParser = new Parser();
    const bidsParser = new Parser();
    const transactionsParser = new Parser();

    const tasksCsv = tasks.length > 0 ? tasksParser.parse(tasks) : '';
    const bidsCsv = bids.length > 0 ? bidsParser.parse(bids) : '';
    const transactionsCsv = transactions.length > 0 ? transactionsParser.parse(transactions) : '';

    // Create ZIP or separate files
    const filename = `user_${userId}_export_${Date.now()}.csv`;
    const filepath = path.join(exportsDir, filename);

    const csvContent = [
      '=== TASKS ===',
      tasksCsv,
      '',
      '=== BIDS ===',
      bidsCsv,
      '',
      '=== TRANSACTIONS ===',
      transactionsCsv
    ].join('\n');

    fs.writeFileSync(filepath, csvContent);

    return {
      success: true,
      filename,
      filepath,
      size: fs.statSync(filepath).size
    };
  } catch (error) {
    console.error('Export user data CSV error:', error);
    return { success: false, error: error.message };
  }
};

// Export platform analytics
const exportPlatformAnalytics = async (startDate, endDate) => {
  try {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = startDate || endDate ? { createdAt: dateFilter } : {};

    // Aggregate data
    const [users, tasks, bids, transactions, reviews, disputes] = await Promise.all([
      User.countDocuments(filter),
      Task.find(filter).lean(),
      Bid.find(filter).lean(),
      Transaction.find(filter).lean(),
      Review.find(filter).lean(),
      Dispute.find(filter).lean()
    ]);

    const analytics = {
      period: {
        start: startDate || 'all time',
        end: endDate || 'now'
      },
      summary: {
        totalUsers: users,
        totalTasks: tasks.length,
        totalBids: bids.length,
        totalTransactions: transactions.length,
        totalReviews: reviews.length,
        totalDisputes: disputes.length
      },
      financial: {
        totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
        totalFees: transactions.reduce((sum, t) => sum + t.platformFee, 0),
        avgTransactionAmount: transactions.length > 0
          ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
          : 0
      },
      tasks: {
        byStatus: {},
        byCategory: {}
      },
      exportDate: new Date().toISOString()
    };

    // Group tasks by status and category
    tasks.forEach(task => {
      analytics.tasks.byStatus[task.status] = (analytics.tasks.byStatus[task.status] || 0) + 1;
      analytics.tasks.byCategory[task.category] = (analytics.tasks.byCategory[task.category] || 0) + 1;
    });

    const filename = `platform_analytics_${Date.now()}.json`;
    const filepath = path.join(exportsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(analytics, null, 2));

    return {
      success: true,
      filename,
      filepath,
      size: fs.statSync(filepath).size
    };
  } catch (error) {
    console.error('Export platform analytics error:', error);
    return { success: false, error: error.message };
  }
};

// Clean old export files
const cleanOldExports = (days = 7) => {
  try {
    const files = fs.readdirSync(exportsDir);
    const now = Date.now();
    const maxAge = days * 24 * 60 * 60 * 1000;

    let cleaned = 0;
    files.forEach(file => {
      const filepath = path.join(exportsDir, file);
      const stats = fs.statSync(filepath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        fs.unlinkSync(filepath);
        cleaned++;
      }
    });

    console.log(`Cleaned ${cleaned} old export files`);
    return { success: true, cleaned };
  } catch (error) {
    console.error('Clean old exports error:', error);
    return { success: false, error: error.message };
  }
};

// Get export file
const getExportFile = (filename) => {
  try {
    const filepath = path.join(exportsDir, filename);

    if (!fs.existsSync(filepath)) {
      return { success: false, error: 'File not found' };
    }

    return {
      success: true,
      filepath,
      exists: true
    };
  } catch (error) {
    console.error('Get export file error:', error);
    return { success: false, error: error.message };
  }
};

// Delete export file
const deleteExportFile = (filename) => {
  try {
    const filepath = path.join(exportsDir, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return { success: true };
    }

    return { success: false, error: 'File not found' };
  } catch (error) {
    console.error('Delete export file error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  exportUserDataJSON,
  exportUserDataCSV,
  exportPlatformAnalytics,
  cleanOldExports,
  getExportFile,
  deleteExportFile
};

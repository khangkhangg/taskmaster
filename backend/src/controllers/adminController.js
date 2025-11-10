const User = require('../models/User');
const Task = require('../models/Task');
const Bid = require('../models/Bid');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const Transaction = require('../models/Transaction');

// Get all users with filtering and pagination
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      accountType,
      isActive,
      isSuspended,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (accountType) query.accountType = accountType;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isSuspended !== undefined) query.isSuspended = isSuspended === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const users = await User.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user details with full history
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's tasks
    const tasks = await Task.find({ poster: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's bids
    const bids = await Bid.find({ bidder: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('task', 'title budget');

    // Get user's reviews
    const reviewsReceived = await Review.find({ reviewee: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('reviewer', 'name avatar');

    // Get user's transactions
    const transactions = await Transaction.find({
      $or: [{ payer: userId }, { payee: userId }]
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's disputes
    const disputes = await Dispute.find({
      $or: [{ complainant: userId }, { defendant: userId }]
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      activity: {
        tasks,
        bids,
        reviewsReceived,
        transactions,
        disputes
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Suspend user
exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body; // duration in days

    if (!reason) {
      return res.status(400).json({ message: 'Suspension reason is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot suspend admins
    if (user.accountType === 'admin' || user.accountType === 'superadmin') {
      return res.status(403).json({ message: 'Cannot suspend admin users' });
    }

    const suspendedUntil = duration
      ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      : null;

    user.isSuspended = true;
    user.suspensionReason = reason;
    user.suspendedUntil = suspendedUntil;
    user.suspendedBy = req.userId;
    user.moderationNotes.push({
      note: `User suspended: ${reason}`,
      addedBy: req.userId
    });

    await user.save();

    res.json({
      message: 'User suspended successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isSuspended: user.isSuspended,
        suspensionReason: user.suspensionReason,
        suspendedUntil: user.suspendedUntil
      }
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unsuspend user
exports.unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isSuspended = false;
    user.suspensionReason = undefined;
    user.suspendedUntil = undefined;
    user.moderationNotes.push({
      note: 'User suspension lifted',
      addedBy: req.userId
    });

    await user.save();

    res.json({
      message: 'User unsuspended successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isSuspended: user.isSuspended
      }
    });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify user identity
exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { verificationType } = req.body; // 'email', 'phone', or 'identity'

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (verificationType === 'email') {
      user.verification.email = true;
    } else if (verificationType === 'phone') {
      user.verification.phone = true;
    } else if (verificationType === 'identity') {
      user.verification.identity = true;
      // Award verified badge
      const hasVerifiedBadge = user.badges.some(b => b.name === 'Verified');
      if (!hasVerifiedBadge) {
        user.badges.push({
          name: 'Verified',
          icon: 'verified',
          description: 'Identity verified by admin'
        });
      }
    } else {
      return res.status(400).json({ message: 'Invalid verification type' });
    }

    user.moderationNotes.push({
      note: `${verificationType} verification approved`,
      addedBy: req.userId
    });

    await user.save();

    res.json({
      message: 'User verification updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        verification: user.verification
      }
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add moderation note
exports.addModerationNote = async (req, res) => {
  try {
    const { userId } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ message: 'Note is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.moderationNotes.push({
      note,
      addedBy: req.userId
    });

    await user.save();

    res.json({
      message: 'Moderation note added successfully',
      note: user.moderationNotes[user.moderationNotes.length - 1]
    });
  } catch (error) {
    console.error('Add moderation note error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Promote user to admin (superadmin only)
exports.promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.accountType = 'admin';
    user.moderationNotes.push({
      note: 'User promoted to admin',
      addedBy: req.userId
    });

    await user.save();

    res.json({
      message: 'User promoted to admin successfully',
      user: {
        _id: user._id,
        name: user.name,
        accountType: user.accountType
      }
    });
  } catch (error) {
    console.error('Promote to admin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Demote admin to user (superadmin only)
exports.demoteAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.accountType === 'superadmin') {
      return res.status(403).json({ message: 'Cannot demote superadmin' });
    }

    user.accountType = 'user';
    user.moderationNotes.push({
      note: 'Admin privileges revoked',
      addedBy: req.userId
    });

    await user.save();

    res.json({
      message: 'Admin demoted to user successfully',
      user: {
        _id: user._id,
        name: user.name,
        accountType: user.accountType
      }
    });
  } catch (error) {
    console.error('Demote admin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user (superadmin only - soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.accountType === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete superadmin' });
    }

    user.isActive = false;
    user.isSuspended = true;
    user.suspensionReason = 'Account permanently deleted by admin';
    user.moderationNotes.push({
      note: 'Account deleted',
      addedBy: req.userId
    });

    await user.save();

    res.json({
      message: 'User deleted successfully',
      user: {
        _id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;

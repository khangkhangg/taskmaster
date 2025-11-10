const User = require('../models/User');
const Task = require('../models/Task');

// Get public user profile
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('savedTasks', 'title budget status createdAt')
      .populate('followers', 'name avatar rating')
      .populate('following', 'name avatar rating');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user follows this user
    const isFollowing = req.userId
      ? user.followers.some(f => f._id.toString() === req.userId.toString())
      : false;

    res.json({
      success: true,
      data: {
        user,
        isFollowing
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'bio', 'skills', 'expertise', 'hourlyRate',
      'portfolio', 'socialLinks', 'location', 'avatar', 'phone'
    ];

    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const {
      query,
      skills,
      city,
      minRating,
      page = 1,
      limit = 20,
      sort = '-rating.count'
    } = req.query;

    const searchQuery = {};

    if (query) {
      searchQuery.$or = [
        { name: new RegExp(query, 'i') },
        { bio: new RegExp(query, 'i') },
        { expertise: new RegExp(query, 'i') }
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',');
      searchQuery.skills = { $in: skillsArray };
    }

    if (city) {
      searchQuery['location.city'] = new RegExp(city, 'i');
    }

    if (minRating) {
      searchQuery['rating.average'] = { $gte: Number(minRating) };
    }

    const skip = (page - 1) * limit;

    const users = await User.find(searchQuery)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        users,
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

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add to following/followers
    currentUser.following.push(userId);
    userToFollow.followers.push(req.userId);

    // Update stats
    currentUser.stats.followingCount += 1;
    userToFollow.stats.followersCount += 1;

    await currentUser.save();
    await userToFollow.save();

    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(req.userId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    // Remove from following/followers
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.userId.toString()
    );

    // Update stats
    currentUser.stats.followingCount -= 1;
    userToUnfollow.stats.followersCount -= 1;

    await currentUser.save();
    await userToUnfollow.save();

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get followers
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('followers', 'name avatar rating stats');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user.followers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get following
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('following', 'name avatar rating stats');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user.following
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save/bookmark a task
exports.saveTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const user = await User.findById(req.userId);

    // Check if already saved
    if (user.savedTasks.includes(taskId)) {
      return res.status(400).json({ error: 'Task already saved' });
    }

    user.savedTasks.push(taskId);
    await user.save();

    res.json({
      success: true,
      message: 'Task saved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unsave/unbookmark a task
exports.unsaveTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const user = await User.findById(req.userId);

    // Check if saved
    if (!user.savedTasks.includes(taskId)) {
      return res.status(400).json({ error: 'Task not saved' });
    }

    user.savedTasks = user.savedTasks.filter(
      id => id.toString() !== taskId
    );
    await user.save();

    res.json({
      success: true,
      message: 'Task unsaved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get saved tasks
exports.getSavedTasks = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.userId)
      .populate({
        path: 'savedTasks',
        options: {
          skip,
          limit: Number(limit),
          sort: '-createdAt'
        },
        populate: {
          path: 'poster',
          select: 'name avatar rating'
        }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        tasks: user.savedTasks,
        total: user.savedTasks.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recommended users to follow
exports.getRecommendedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);

    // Find users with similar skills
    const recommendedUsers = await User.find({
      _id: { $ne: req.userId, $nin: currentUser.following },
      skills: { $in: currentUser.skills || [] }
    })
      .select('name avatar bio skills rating stats')
      .sort('-rating.average -stats.tasksCompleted')
      .limit(10);

    res.json({
      success: true,
      data: recommendedUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('stats rating verification');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        stats: user.stats,
        rating: user.rating,
        verification: user.verification
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

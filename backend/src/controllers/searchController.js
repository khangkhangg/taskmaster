const Task = require('../models/Task');
const User = require('../models/User');
const Bid = require('../models/Bid');

// Advanced task search with multiple filters
exports.advancedTaskSearch = async (req, res) => {
  try {
    const {
      query,
      category,
      minBudget,
      maxBudget,
      location,
      locationType,
      skills,
      status = 'open',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build search query
    const searchQuery = { status };

    // Text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      searchQuery.category = category;
    }

    // Budget range filter
    if (minBudget || maxBudget) {
      searchQuery.$and = searchQuery.$and || [];
      if (minBudget) {
        searchQuery.$and.push({ 'budget.min': { $gte: parseInt(minBudget) } });
      }
      if (maxBudget) {
        searchQuery.$and.push({ 'budget.max': { $lte: parseInt(maxBudget) } });
      }
    }

    // Location filter
    if (location) {
      searchQuery.$or = searchQuery.$or || [];
      searchQuery.$or.push({ 'location.city': { $regex: location, $options: 'i' } });
      searchQuery.$or.push({ 'location.country': { $regex: location, $options: 'i' } });
    }

    // Location type filter
    if (locationType) {
      searchQuery['location.type'] = locationType;
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      searchQuery.requiredSkills = { $in: skillsArray };
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const tasks = await Task.find(searchQuery)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('poster', 'name avatar rating verification')
      .lean();

    const total = await Task.countDocuments(searchQuery);

    // Calculate relevance scores (simple implementation)
    const tasksWithScore = tasks.map(task => {
      let score = 0;

      // Boost score if query matches title
      if (query && task.title.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
      }

      // Boost score for verified posters
      if (task.poster?.verification?.identity) {
        score += 5;
      }

      // Boost score for posters with high ratings
      if (task.poster?.rating?.average >= 4.5) {
        score += 3;
      }

      // Boost score for recently posted tasks
      const daysOld = (Date.now() - new Date(task.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) {
        score += 5 - Math.floor(daysOld);
      }

      return { ...task, relevanceScore: score };
    });

    // Sort by relevance if query is provided
    if (query && sortBy === 'relevance') {
      tasksWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    res.json({
      tasks: tasksWithScore,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      filters: {
        query,
        category,
        minBudget,
        maxBudget,
        location,
        locationType,
        skills,
        status
      }
    });
  } catch (error) {
    console.error('Advanced task search error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Advanced user search
exports.advancedUserSearch = async (req, res) => {
  try {
    const {
      query,
      skills,
      minRating,
      city,
      country,
      verified,
      sortBy = 'rating.average',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build search query
    const searchQuery = { isActive: true, isSuspended: false };

    // Text search
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { expertise: { $regex: query, $options: 'i' } },
      ];
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      searchQuery.skills = { $in: skillsArray };
    }

    // Rating filter
    if (minRating) {
      searchQuery['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Location filters
    if (city) {
      searchQuery['location.city'] = { $regex: city, $options: 'i' };
    }
    if (country) {
      searchQuery['location.country'] = { $regex: country, $options: 'i' };
    }

    // Verification filter
    if (verified === 'true') {
      searchQuery['verification.identity'] = true;
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const users = await User.find(searchQuery)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-password')
      .lean();

    const total = await User.countDocuments(searchQuery);

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
    console.error('Advanced user search error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Global search (tasks, users, bids)
exports.globalSearch = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    // Search tasks
    const tasks = await Task.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
      status: 'open'
    })
      .limit(parseInt(limit))
      .populate('poster', 'name avatar')
      .select('title category budget location createdAt')
      .lean();

    // Search users
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { expertise: { $regex: query, $options: 'i' } },
      ],
      isActive: true,
      isSuspended: false
    })
      .limit(parseInt(limit))
      .select('name avatar rating verification stats')
      .lean();

    res.json({
      query,
      results: {
        tasks: {
          count: tasks.length,
          items: tasks
        },
        users: {
          count: users.length,
          items: users
        }
      }
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get search suggestions
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { query, type = 'tasks' } = req.query;

    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    let suggestions = [];

    if (type === 'tasks') {
      // Get task title suggestions
      const tasks = await Task.find({
        title: { $regex: query, $options: 'i' },
        status: 'open'
      })
        .limit(10)
        .select('title')
        .lean();

      suggestions = tasks.map(t => t.title);
    } else if (type === 'users') {
      // Get user name suggestions
      const users = await User.find({
        name: { $regex: query, $options: 'i' },
        isActive: true
      })
        .limit(10)
        .select('name')
        .lean();

      suggestions = users.map(u => u.name);
    } else if (type === 'skills') {
      // Get skill suggestions (aggregate from users)
      const skillsAgg = await User.aggregate([
        { $unwind: '$skills' },
        { $match: { skills: { $regex: query, $options: 'i' } } },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      suggestions = skillsAgg.map(s => s._id);
    }

    // Remove duplicates and filter
    suggestions = [...new Set(suggestions)].filter(s =>
      s.toLowerCase().includes(query.toLowerCase())
    );

    res.json({ suggestions });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get popular searches
exports.getPopularSearches = async (req, res) => {
  try {
    // Get popular categories
    const popularCategories = await Task.aggregate([
      { $match: { status: 'open' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get popular skills
    const popularSkills = await User.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get popular locations
    const popularLocations = await Task.aggregate([
      { $match: { status: 'open', 'location.city': { $exists: true, $ne: '' } } },
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      categories: popularCategories.map(c => ({ name: c._id, count: c.count })),
      skills: popularSkills.map(s => ({ name: s._id, count: s.count })),
      locations: popularLocations.map(l => ({ name: l._id, count: l.count }))
    });
  } catch (error) {
    console.error('Get popular searches error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;

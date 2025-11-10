const Review = require('../models/Review');
const Task = require('../models/Task');
const User = require('../models/User');
const { calculateTrustScore } = require('../utils/trustScore');
const { notifyNewReview } = require('../utils/notifications');

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { taskId, rating, comment, qualityRatings } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed tasks' });
    }

    // Determine review type and reviewee
    let reviewType, reviewee;

    if (task.poster.toString() === req.userId.toString()) {
      // Poster reviewing doer
      if (!task.assignedTo) {
        return res.status(400).json({ error: 'Task has no assigned doer' });
      }
      reviewType = 'poster_to_doer';
      reviewee = task.assignedTo;
    } else if (task.assignedTo && task.assignedTo.toString() === req.userId.toString()) {
      // Doer reviewing poster
      reviewType = 'doer_to_poster';
      reviewee = task.poster;
    } else {
      return res.status(403).json({ error: 'Not authorized to review this task' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      task: taskId,
      reviewer: req.userId,
      reviewType
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this task' });
    }

    // Create review
    const review = new Review({
      task: taskId,
      reviewer: req.userId,
      reviewee,
      rating,
      comment,
      reviewType,
      qualityRatings
    });

    await review.save();

    // Update reviewee's rating
    const revieweeUser = await User.findById(reviewee);
    const allReviews = await Review.find({ reviewee });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    revieweeUser.rating.average = averageRating;
    revieweeUser.rating.count = allReviews.length;

    await revieweeUser.save();

    await review.populate([
      { path: 'reviewer', select: 'name avatar' },
      { path: 'reviewee', select: 'name avatar' },
      { path: 'task', select: 'title' }
    ]);

    // Notify the reviewee about the new review
    await notifyNewReview(review, review.reviewer);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reviews for a user
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, page = 1, limit = 10 } = req.query;

    const query = { reviewee: userId };
    if (type) {
      query.reviewType = type;
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate('reviewer', 'name avatar rating verification')
      .populate('task', 'title category')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    // Calculate rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { reviewee: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        ratingBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get task reviews (both sides)
exports.getTaskReviews = async (req, res) => {
  try {
    const { taskId } = req.params;

    const reviews = await Review.find({ task: taskId })
      .populate('reviewer', 'name avatar rating')
      .populate('reviewee', 'name avatar rating');

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user trust score
exports.getUserTrustScore = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const reviews = await Review.find({ reviewee: userId });

    const trustScore = calculateTrustScore(user, reviews);

    res.json({
      success: true,
      data: {
        trustScore,
        user: {
          rating: user.rating,
          stats: user.stats,
          verification: user.verification
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark review as helpful
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.helpful += 1;
    await review.save();

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Respond to a review (reviewee can respond)
exports.respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { text } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.reviewee.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Only the reviewee can respond' });
    }

    if (review.response) {
      return res.status(400).json({ error: 'Response already exists' });
    }

    review.response = {
      text,
      createdAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

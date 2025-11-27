const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Create a test user object
 */
const createUserData = (overrides = {}) => {
  return {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    phoneNumber: '+1234567890',
    location: 'Test City',
    bio: 'Test bio',
    role: 'doer',
    ...overrides
  };
};

/**
 * Create a hashed password for testing
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Create a test task object
 */
const createTaskData = (userId, overrides = {}) => {
  return {
    poster: userId,
    title: 'Test Task',
    description: 'Test task description',
    category: 'cleaning',
    budget: 100,
    location: 'Test Location',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'open',
    ...overrides
  };
};

/**
 * Create a test bid object
 */
const createBidData = (taskId, userId, overrides = {}) => {
  return {
    task: taskId,
    bidder: userId,
    amount: 80,
    proposedTimeline: '2-3 days',
    coverLetter: 'I am interested in this task',
    status: 'pending',
    ...overrides
  };
};

/**
 * Create a test review object
 */
const createReviewData = (taskId, reviewerId, revieweeId, overrides = {}) => {
  return {
    task: taskId,
    reviewer: reviewerId,
    reviewee: revieweeId,
    rating: 5,
    comment: 'Great work!',
    qualityRatings: {
      communication: 5,
      professionalism: 5,
      timeliness: 5,
      quality: 5
    },
    ...overrides
  };
};

/**
 * Generate a JWT token for testing
 */
const generateAuthToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test_secret', {
    expiresIn: '1h'
  });
};

/**
 * Create a test transaction object
 */
const createTransactionData = (taskId, payerId, payeeId, overrides = {}) => {
  const amount = 100;
  const platformFee = Math.round(amount * 0.10);

  return {
    task: taskId,
    payer: payerId,
    payee: payeeId,
    amount,
    platformFee,
    payeeAmount: amount - platformFee,
    status: 'held',
    ...overrides
  };
};

/**
 * Create a test message object
 */
const createMessageData = (taskId, senderId, recipientId, overrides = {}) => {
  return {
    task: taskId,
    sender: senderId,
    recipient: recipientId,
    content: 'Test message',
    ...overrides
  };
};

/**
 * Create a test notification object
 */
const createNotificationData = (userId, overrides = {}) => {
  return {
    user: userId,
    type: 'bid',
    title: 'New Bid',
    message: 'You have received a new bid',
    read: false,
    ...overrides
  };
};

module.exports = {
  createUserData,
  hashPassword,
  createTaskData,
  createBidData,
  createReviewData,
  generateAuthToken,
  createTransactionData,
  createMessageData,
  createNotificationData
};

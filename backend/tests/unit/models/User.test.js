const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const { connect, closeDatabase, clearDatabase } = require('../../helpers/testDb');
const { createUserData, hashPassword } = require('../../helpers/factories');

describe('User Model', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('User Creation', () => {
    it('should create a user successfully with valid data', async () => {
      const userData = createUserData();
      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.fullName).toBe(userData.fullName);
      expect(savedUser.role).toBe(userData.role);
    });

    it('should fail to create user without required fields', async () => {
      const user = new User({});
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.username).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should fail to create user with duplicate email', async () => {
      const userData = createUserData();

      await User.create(userData);

      const duplicateUser = new User(userData);
      let error;

      try {
        await duplicateUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    it('should hash password before saving', async () => {
      const userData = createUserData({ password: 'plainPassword123' });
      const user = await User.create(userData);

      expect(user.password).not.toBe('plainPassword123');
      expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });

  describe('User Methods', () => {
    it('should correctly validate password with comparePassword method', async () => {
      const password = 'testPassword123';
      const userData = createUserData({ password });
      const user = await User.create(userData);

      const isMatch = await user.comparePassword(password);
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongPassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('User Stats', () => {
    it('should initialize user with default stats', async () => {
      const userData = createUserData();
      const user = await User.create(userData);

      expect(user.stats).toBeDefined();
      expect(user.stats.tasksPosted).toBe(0);
      expect(user.stats.tasksCompleted).toBe(0);
      expect(user.stats.bidsPlaced).toBe(0);
      expect(user.stats.bidsWon).toBe(0);
      expect(user.stats.averageRating).toBe(0);
      expect(user.stats.totalReviews).toBe(0);
    });

    it('should initialize trust score with default values', async () => {
      const userData = createUserData();
      const user = await User.create(userData);

      expect(user.trustScore).toBeDefined();
      expect(user.trustScore.score).toBe(50); // Default trust score
      expect(user.trustScore.level).toBe('new');
    });
  });

  describe('User Roles and Verification', () => {
    it('should create user with default role as doer', async () => {
      const userData = createUserData();
      delete userData.role;
      const user = await User.create(userData);

      expect(user.role).toBe('doer');
    });

    it('should initialize verification fields as false', async () => {
      const userData = createUserData();
      const user = await User.create(userData);

      expect(user.isEmailVerified).toBe(false);
      expect(user.isPhoneVerified).toBe(false);
      expect(user.isIdentityVerified).toBe(false);
    });

    it('should allow setting account type to admin', async () => {
      const userData = createUserData({ accountType: 'admin' });
      const user = await User.create(userData);

      expect(user.accountType).toBe('admin');
    });
  });

  describe('User Portfolio and Social Features', () => {
    it('should initialize empty arrays for portfolio and followers', async () => {
      const userData = createUserData();
      const user = await User.create(userData);

      expect(user.portfolio).toEqual([]);
      expect(user.savedTasks).toEqual([]);
      expect(user.following).toEqual([]);
      expect(user.followers).toEqual([]);
    });

    it('should allow adding portfolio items', async () => {
      const userData = createUserData();
      const user = await User.create(userData);

      user.portfolio.push({
        title: 'Sample Project',
        description: 'Project description',
        completedAt: new Date()
      });

      await user.save();

      expect(user.portfolio).toHaveLength(1);
      expect(user.portfolio[0].title).toBe('Sample Project');
    });
  });

  describe('User Timestamps', () => {
    it('should automatically set createdAt and updatedAt timestamps', async () => {
      const userData = createUserData();
      const user = await User.create(userData);

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when user is modified', async () => {
      const userData = createUserData();
      const user = await User.create(userData);

      const originalUpdatedAt = user.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 1000));

      user.bio = 'Updated bio';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});

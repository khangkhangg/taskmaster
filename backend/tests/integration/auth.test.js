const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../src/server');
const User = require('../../src/models/User');
const { connect, closeDatabase, clearDatabase } = require('../helpers/testDb');
const { createUserData } = require('../helpers/factories');

describe('Auth API Integration Tests', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = createUserData();

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.token).toBeDefined();

      // Verify password is not returned
      expect(response.body.data.user.password).toBeUndefined();

      // Verify user exists in database
      const dbUser = await User.findOne({ email: userData.email });
      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(userData.email);
    });

    it('should fail to register with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // Missing username and password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should fail to register with duplicate email', async () => {
      const userData = createUserData();

      // Create first user
      await User.create(userData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/already exists|duplicate/i);
    });

    it('should fail to register with invalid email format', async () => {
      const userData = createUserData({ email: 'invalid-email' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail to register with weak password', async () => {
      const userData = createUserData({ password: '123' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      const userData = createUserData();
      await User.create(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail to login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/invalid|credentials/i);
    });

    it('should fail to login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail to login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // Missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return user with stats and trust score', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.data.user.stats).toBeDefined();
      expect(response.body.data.user.trustScore).toBeDefined();
      expect(response.body.data.user.trustScore.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Create user and get auth token
      const userData = createUserData();
      const user = await User.create(userData);
      userId = user._id;

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      authToken = loginResponse.body.data.token;
    });

    it('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe(userId.toString());
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.password).toBeUndefined();
    });

    it('should fail to get profile without auth token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/token|authorization/i);
    });

    it('should fail to get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/update-profile', () => {
    let authToken;

    beforeEach(async () => {
      // Create user and get auth token
      const userData = createUserData();
      await User.create(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      authToken = loginResponse.body.data.token;
    });

    it('should update user profile successfully', async () => {
      const updates = {
        fullName: 'Updated Name',
        bio: 'Updated bio',
        location: 'New City'
      };

      const response = await request(app)
        .put('/api/auth/update-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fullName).toBe(updates.fullName);
      expect(response.body.data.bio).toBe(updates.bio);
      expect(response.body.data.location).toBe(updates.location);
    });

    it('should fail to update profile without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/update-profile')
        .send({ fullName: 'New Name' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not allow updating email through update-profile', async () => {
      const response = await request(app)
        .put('/api/auth/update-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'newemail@example.com',
          fullName: 'New Name'
        });

      // Email should not be updated even if provided
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeDefined();
      expect(user.fullName).toBe('New Name');
    });
  });
});

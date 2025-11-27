const request = require('supertest');
const { app } = require('../../src/server');
const User = require('../../src/models/User');
const Task = require('../../src/models/Task');
const { connect, closeDatabase, clearDatabase } = require('../helpers/testDb');
const { createUserData, createTaskData, generateAuthToken } = require('../helpers/factories');

describe('Tasks API Integration Tests', () => {
  let authToken;
  let userId;
  let user;

  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create a test user
    const userData = createUserData();
    user = await User.create(userData);
    userId = user._id;
    authToken = generateAuthToken(userId);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'Clean my house',
        description: 'Need someone to clean my 2-bedroom apartment',
        category: 'cleaning',
        budget: 150,
        location: 'New York, NY',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.category).toBe(taskData.category);
      expect(response.body.data.budget).toBe(taskData.budget);
      expect(response.body.data.status).toBe('open');
      expect(response.body.data.poster).toBe(userId.toString());

      // Verify in database
      const dbTask = await Task.findById(response.body.data._id);
      expect(dbTask).toBeDefined();
      expect(dbTask.title).toBe(taskData.title);
    });

    it('should fail to create task without authentication', async () => {
      const taskData = createTaskData(userId);

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail to create task with missing required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Incomplete task'
          // Missing description, category, budget, etc.
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail to create task with negative budget', async () => {
      const taskData = createTaskData(userId, { budget: -50 });

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create multiple tasks
      await Task.create(createTaskData(userId, { title: 'Task 1', category: 'cleaning' }));
      await Task.create(createTaskData(userId, { title: 'Task 2', category: 'moving' }));
      await Task.create(createTaskData(userId, { title: 'Task 3', status: 'completed' }));
    });

    it('should get all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=open')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(task => {
        expect(task.status).toBe('open');
      });
    });

    it('should filter tasks by category', async () => {
      const response = await request(app)
        .get('/api/tasks?category=cleaning')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(task => {
        expect(task.category).toBe('cleaning');
      });
    });

    it('should search tasks by keyword', async () => {
      const response = await request(app)
        .get('/api/tasks?search=Task 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toContain('Task 1');
    });
  });

  describe('GET /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create(createTaskData(userId));
      taskId = task._id;
    });

    it('should get a task by ID', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(taskId.toString());
      expect(response.body.data.poster).toBeDefined();
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid task ID format', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create(createTaskData(userId));
      taskId = task._id;
    });

    it('should update task successfully by owner', async () => {
      const updates = {
        title: 'Updated Task Title',
        budget: 200,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.budget).toBe(updates.budget);
      expect(response.body.data.description).toBe(updates.description);

      // Verify in database
      const dbTask = await Task.findById(taskId);
      expect(dbTask.title).toBe(updates.title);
    });

    it('should fail to update task without authentication', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Title' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail to update task by non-owner', async () => {
      // Create another user
      const otherUser = await User.create(createUserData({
        email: 'other@example.com',
        username: 'otheruser'
      }));
      const otherToken = generateAuthToken(otherUser._id);

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Updated by other' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create(createTaskData(userId));
      taskId = task._id;
    });

    it('should delete task successfully by owner', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/deleted/i);

      // Verify task is deleted
      const dbTask = await Task.findById(taskId);
      expect(dbTask).toBeNull();
    });

    it('should fail to delete task without authentication', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(401);

      expect(response.body.success).toBe(false);

      // Verify task still exists
      const dbTask = await Task.findById(taskId);
      expect(dbTask).toBeDefined();
    });

    it('should fail to delete task by non-owner', async () => {
      // Create another user
      const otherUser = await User.create(createUserData({
        email: 'other@example.com',
        username: 'otheruser'
      }));
      const otherToken = generateAuthToken(otherUser._id);

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);

      // Verify task still exists
      const dbTask = await Task.findById(taskId);
      expect(dbTask).toBeDefined();
    });
  });

  describe('GET /api/tasks/my-tasks', () => {
    beforeEach(async () => {
      // Create tasks for the authenticated user
      await Task.create(createTaskData(userId, { title: 'My Task 1' }));
      await Task.create(createTaskData(userId, { title: 'My Task 2' }));

      // Create task for another user
      const otherUser = await User.create(createUserData({
        email: 'other@example.com',
        username: 'otheruser'
      }));
      await Task.create(createTaskData(otherUser._id, { title: 'Other Task' }));
    });

    it('should get only tasks posted by authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);

      response.body.data.forEach(task => {
        expect(task.poster).toBe(userId.toString());
        expect(task.title).toContain('My Task');
      });
    });

    it('should fail to get my-tasks without authentication', async () => {
      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

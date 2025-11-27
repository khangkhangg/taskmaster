# Testing Guide for TaskMaster Backend

This document provides comprehensive information about the testing infrastructure for the TaskMaster backend API.

## Table of Contents

1. [Overview](#overview)
2. [Testing Stack](#testing-stack)
3. [Test Structure](#test-structure)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Test Helpers](#test-helpers)
7. [Best Practices](#best-practices)
8. [Coverage Requirements](#coverage-requirements)
9. [Continuous Integration](#continuous-integration)

---

## Overview

The TaskMaster backend uses a comprehensive testing strategy that includes:
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test API endpoints and their interactions
- **In-Memory Database**: Uses MongoDB Memory Server for fast, isolated tests
- **Code Coverage**: Tracks test coverage with thresholds

---

## Testing Stack

### Core Libraries

- **Jest**: Testing framework
  - Version: ^29.7.0
  - Purpose: Test runner, assertions, mocking

- **Supertest**: HTTP testing
  - Version: ^6.3.3
  - Purpose: API endpoint testing

- **MongoDB Memory Server**: In-memory database
  - Version: ^9.1.6
  - Purpose: Fast, isolated database for tests

- **@shelf/jest-mongodb**: Jest preset for MongoDB
  - Version: ^4.2.0
  - Purpose: MongoDB testing utilities

---

## Test Structure

```
backend/
├── tests/
│   ├── setup.js              # Global test setup
│   ├── helpers/
│   │   ├── testDb.js         # Database utilities
│   │   └── factories.js      # Test data factories
│   ├── unit/
│   │   └── models/
│   │       └── User.test.js  # Unit tests for models
│   └── integration/
│       ├── auth.test.js      # Auth API integration tests
│       └── tasks.test.js     # Tasks API integration tests
├── jest.config.js            # Jest configuration
└── .env.test                 # Test environment variables
```

---

## Running Tests

### All Tests

```bash
npm test
```

This runs all tests with coverage reporting.

### Watch Mode

```bash
npm run test:watch
```

Automatically re-runs tests when files change. Useful during development.

### Unit Tests Only

```bash
npm run test:unit
```

Runs only unit tests (tests in `tests/unit/` directory).

### Integration Tests Only

```bash
npm run test:integration
```

Runs only integration tests (tests in `tests/integration/` directory).

### CI Mode

```bash
npm run test:ci
```

Runs tests in CI mode with limited workers and coverage reporting.

### Specific Test File

```bash
npm test -- tests/integration/auth.test.js
```

Runs a specific test file.

### Specific Test Suite

```bash
npm test -- --testNamePattern="User Model"
```

Runs tests matching the pattern.

---

## Writing Tests

### Unit Test Example

```javascript
const User = require('../../../src/models/User');
const { connect, closeDatabase, clearDatabase } = require('../../helpers/testDb');
const { createUserData } = require('../../helpers/factories');

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

  it('should create a user successfully', async () => {
    const userData = createUserData();
    const user = await User.create(userData);

    expect(user._id).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const { app } = require('../../src/server');
const { connect, closeDatabase, clearDatabase } = require('../helpers/testDb');
const { createUserData, generateAuthToken } = require('../helpers/factories');

describe('Tasks API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();

    const user = await User.create(createUserData());
    userId = user._id;
    authToken = generateAuthToken(userId);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('should create a task', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Task', /* ... */ })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Task');
  });
});
```

---

## Test Helpers

### Database Helpers (`tests/helpers/testDb.js`)

#### `connect()`
Connects to an in-memory MongoDB instance.

```javascript
await connect();
```

#### `closeDatabase()`
Closes the database connection and stops the MongoDB server.

```javascript
await closeDatabase();
```

#### `clearDatabase()`
Clears all data from all collections.

```javascript
await clearDatabase();
```

### Test Data Factories (`tests/helpers/factories.js`)

#### `createUserData(overrides)`
Creates test user data.

```javascript
const userData = createUserData({
  email: 'custom@example.com',
  username: 'customuser'
});
```

#### `createTaskData(userId, overrides)`
Creates test task data.

```javascript
const taskData = createTaskData(userId, {
  title: 'Custom Task',
  budget: 200
});
```

#### `createBidData(taskId, userId, overrides)`
Creates test bid data.

```javascript
const bidData = createBidData(taskId, userId, {
  amount: 150
});
```

#### `generateAuthToken(userId)`
Generates a JWT token for testing.

```javascript
const token = generateAuthToken(userId);
```

---

## Best Practices

### 1. Test Isolation

Each test should be independent and not rely on other tests.

```javascript
// ✅ Good
beforeEach(async () => {
  await clearDatabase();
  // Create fresh data for each test
});

// ❌ Bad
let globalUser; // Shared state between tests
```

### 2. Descriptive Test Names

Use clear, descriptive test names that explain what is being tested.

```javascript
// ✅ Good
it('should create a user successfully with valid data', async () => {});

// ❌ Bad
it('test 1', async () => {});
```

### 3. Arrange-Act-Assert Pattern

Structure tests with clear setup, execution, and verification sections.

```javascript
it('should update user profile', async () => {
  // Arrange
  const user = await User.create(createUserData());
  const updates = { fullName: 'New Name' };

  // Act
  const result = await user.updateProfile(updates);

  // Assert
  expect(result.fullName).toBe('New Name');
});
```

### 4. Test Both Success and Failure Cases

```javascript
describe('User Registration', () => {
  it('should register successfully with valid data', async () => {
    // Test success case
  });

  it('should fail with missing required fields', async () => {
    // Test failure case
  });

  it('should fail with invalid email format', async () => {
    // Test failure case
  });
});
```

### 5. Use Factory Functions

Use factory functions instead of hardcoding test data.

```javascript
// ✅ Good
const user = await User.create(createUserData());

// ❌ Bad
const user = await User.create({
  username: 'test',
  email: 'test@test.com',
  password: '123',
  // ... many more fields
});
```

### 6. Clean Up After Tests

Always clean up resources after tests.

```javascript
afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
```

### 7. Mock External Services

Mock external services (Redis, Firebase, email) in tests.

```javascript
jest.mock('../../src/services/pushNotificationService', () => ({
  sendPushNotification: jest.fn().mockResolvedValue({ success: true })
}));
```

---

## Coverage Requirements

The project has minimum coverage thresholds defined in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

### Viewing Coverage

After running tests, view the coverage report:

```bash
npm test
```

Coverage reports are generated in:
- **Console**: Text summary
- **HTML**: `coverage/lcov-report/index.html`
- **JSON**: `coverage/coverage-summary.json`

### Coverage Reports

Open the HTML coverage report in a browser:

```bash
open coverage/lcov-report/index.html
```

---

## Continuous Integration

Tests run automatically on every push and pull request via GitHub Actions.

### CI Configuration (`.github/workflows/ci.yml`)

```yaml
- name: Run tests
  working-directory: ./backend
  env:
    NODE_ENV: test
    MONGODB_URI: mongodb://admin:password@localhost:27017/taskmaster_test?authSource=admin
    JWT_SECRET: test_jwt_secret
  run: npm run test:ci
```

### CI Test Requirements

- All tests must pass
- Coverage thresholds must be met
- No lint errors
- No security vulnerabilities

---

## Debugging Tests

### Running a Single Test

```bash
npm test -- -t "should create a user successfully"
```

### Enable Console Output

Edit `tests/setup.js` to allow console output:

```javascript
// Comment out console mocking for debugging
// global.console = { ...console, log: jest.fn() };
```

### Increase Timeout

For slow tests, increase timeout:

```javascript
jest.setTimeout(60000); // 60 seconds
```

Or for a specific test:

```javascript
it('slow test', async () => {
  // test code
}, 60000); // 60 seconds timeout
```

### Debug Mode

Run Jest in debug mode:

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then attach a debugger (Chrome DevTools or VS Code).

---

## Common Issues

### Port Already in Use

If tests fail due to port conflicts, ensure no other server is running on port 5001.

```bash
lsof -ti:5001 | xargs kill -9
```

### MongoDB Memory Server Timeout

Increase timeout in `jest.config.js`:

```javascript
testTimeout: 60000
```

### Open Handles

If tests don't exit cleanly, Jest will report open handles. Ensure all connections are closed:

```javascript
afterAll(async () => {
  await closeDatabase();
  await server.close();
});
```

---

## Test Data Management

### Factories vs. Fixtures

**Factories** (recommended): Generate fresh data for each test
```javascript
const user = createUserData({ email: 'test@example.com' });
```

**Fixtures**: Static test data files
```javascript
const users = require('../fixtures/users.json');
```

Use factories for most cases. Use fixtures only for complex, unchanging data.

---

## Performance Tips

1. **Use in-memory database**: Faster than real MongoDB
2. **Run tests in parallel**: Jest runs tests in parallel by default
3. **Limit workers in CI**: Use `--maxWorkers=2` in CI environments
4. **Clear only necessary data**: Only clear collections you're testing
5. **Use test:watch during development**: Faster feedback loop

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://testingjavascript.com/)

---

## Support

For questions or issues with tests:
- Check existing test files for examples
- Review this documentation
- Check Jest documentation
- Open an issue on GitHub

---

## License

MIT

require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for setup
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Global test setup
beforeAll(async () => {
  // Any global setup can go here
});

// Global test teardown
afterAll(async () => {
  // Cleanup after all tests
  await new Promise(resolve => setTimeout(resolve, 500));
});

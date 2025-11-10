const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'taskmaster-api' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Exception logs
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      handleExceptions: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Helper functions
const log = {
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  error: (message, error = {}) => {
    const meta = {
      error: error.message || error,
      stack: error.stack,
      ...error
    };
    logger.error(message, meta);
  },

  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },

  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },

  http: (message, meta = {}) => {
    logger.http(message, meta);
  },

  // Specific event loggers
  auth: {
    login: (userId, ip) => {
      logger.info('User login', { userId, ip, event: 'auth:login' });
    },
    loginFailed: (email, ip) => {
      logger.warn('Login failed', { email, ip, event: 'auth:login_failed' });
    },
    logout: (userId) => {
      logger.info('User logout', { userId, event: 'auth:logout' });
    },
    register: (userId, email) => {
      logger.info('User registered', { userId, email, event: 'auth:register' });
    },
  },

  task: {
    created: (taskId, userId) => {
      logger.info('Task created', { taskId, userId, event: 'task:created' });
    },
    updated: (taskId, userId) => {
      logger.info('Task updated', { taskId, userId, event: 'task:updated' });
    },
    deleted: (taskId, userId) => {
      logger.info('Task deleted', { taskId, userId, event: 'task:deleted' });
    },
    completed: (taskId, userId) => {
      logger.info('Task completed', { taskId, userId, event: 'task:completed' });
    },
  },

  bid: {
    placed: (bidId, taskId, userId) => {
      logger.info('Bid placed', { bidId, taskId, userId, event: 'bid:placed' });
    },
    accepted: (bidId, taskId, userId) => {
      logger.info('Bid accepted', { bidId, taskId, userId, event: 'bid:accepted' });
    },
    rejected: (bidId, taskId, userId) => {
      logger.info('Bid rejected', { bidId, taskId, userId, event: 'bid:rejected' });
    },
  },

  payment: {
    escrowCreated: (transactionId, amount, taskId) => {
      logger.info('Escrow created', { transactionId, amount, taskId, event: 'payment:escrow_created' });
    },
    paymentReleased: (transactionId, amount, userId) => {
      logger.info('Payment released', { transactionId, amount, userId, event: 'payment:released' });
    },
    refunded: (transactionId, amount, userId) => {
      logger.info('Payment refunded', { transactionId, amount, userId, event: 'payment:refunded' });
    },
  },

  dispute: {
    filed: (disputeId, taskId, userId) => {
      logger.warn('Dispute filed', { disputeId, taskId, userId, event: 'dispute:filed' });
    },
    resolved: (disputeId, resolution, adminId) => {
      logger.info('Dispute resolved', { disputeId, resolution, adminId, event: 'dispute:resolved' });
    },
  },

  admin: {
    userSuspended: (userId, adminId, reason) => {
      logger.warn('User suspended', { userId, adminId, reason, event: 'admin:user_suspended' });
    },
    taskFlagged: (taskId, adminId, reason) => {
      logger.warn('Task flagged', { taskId, adminId, reason, event: 'admin:task_flagged' });
    },
    taskRemoved: (taskId, adminId, reason) => {
      logger.warn('Task removed', { taskId, adminId, reason, event: 'admin:task_removed' });
    },
  },

  api: {
    request: (method, url, userId, statusCode, responseTime) => {
      logger.http('API Request', {
        method,
        url,
        userId,
        statusCode,
        responseTime,
        event: 'api:request'
      });
    },
    error: (method, url, error, statusCode) => {
      logger.error('API Error', {
        method,
        url,
        error: error.message,
        statusCode,
        stack: error.stack,
        event: 'api:error'
      });
    },
  },

  security: {
    rateLimitExceeded: (ip, endpoint) => {
      logger.warn('Rate limit exceeded', { ip, endpoint, event: 'security:rate_limit' });
    },
    suspiciousActivity: (userId, ip, activity) => {
      logger.warn('Suspicious activity', { userId, ip, activity, event: 'security:suspicious' });
    },
  },
};

// Express middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    log.api.request(
      req.method,
      req.originalUrl,
      req.userId || 'anonymous',
      res.statusCode,
      duration
    );
  });

  next();
};

// Express middleware for error logging
const errorLogger = (err, req, res, next) => {
  log.api.error(req.method, req.originalUrl, err, res.statusCode || 500);
  next(err);
};

module.exports = {
  logger,
  log,
  requestLogger,
  errorLogger
};

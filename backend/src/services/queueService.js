const Bull = require('bull');
const { sendEmail } = require('./emailService');
const { sendPushNotification } = require('./pushNotificationService');

// Initialize queues
const emailQueue = new Bull('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  }
});

const notificationQueue = new Bull('notification', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  }
});

const analyticsQueue = new Bull('analytics', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  }
});

// Email queue processor
emailQueue.process(async (job) => {
  const { to, subject, html, text } = job.data;
  console.log(`Processing email job ${job.id} to ${to}`);

  try {
    const result = await sendEmail({ to, subject, html, text });
    return result;
  } catch (error) {
    console.error(`Email job ${job.id} failed:`, error);
    throw error;
  }
});

// Notification queue processor
notificationQueue.process(async (job) => {
  const { fcmToken, notification } = job.data;
  console.log(`Processing notification job ${job.id}`);

  try {
    const result = await sendPushNotification(fcmToken, notification);
    return result;
  } catch (error) {
    console.error(`Notification job ${job.id} failed:`, error);
    throw error;
  }
});

// Analytics queue processor
analyticsQueue.process(async (job) => {
  const { type, data } = job.data;
  console.log(`Processing analytics job ${job.id} - type: ${type}`);

  try {
    // Process analytics data based on type
    switch (type) {
      case 'user_activity':
        // Track user activity
        break;
      case 'task_metrics':
        // Update task metrics
        break;
      case 'platform_stats':
        // Update platform statistics
        break;
      default:
        console.log('Unknown analytics type:', type);
    }
    return { success: true };
  } catch (error) {
    console.error(`Analytics job ${job.id} failed:`, error);
    throw error;
  }
});

// Event listeners for email queue
emailQueue.on('completed', (job, result) => {
  console.log(`Email job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job.id} failed:`, err.message);
});

emailQueue.on('stalled', (job) => {
  console.warn(`Email job ${job.id} stalled`);
});

// Event listeners for notification queue
notificationQueue.on('completed', (job, result) => {
  console.log(`Notification job ${job.id} completed:`, result);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`Notification job ${job.id} failed:`, err.message);
});

// Event listeners for analytics queue
analyticsQueue.on('completed', (job, result) => {
  console.log(`Analytics job ${job.id} completed`);
});

analyticsQueue.on('failed', (job, err) => {
  console.error(`Analytics job ${job.id} failed:`, err.message);
});

// Helper functions to add jobs
const addEmailJob = async (emailData, options = {}) => {
  try {
    const job = await emailQueue.add(emailData, {
      priority: options.priority || 2,
      delay: options.delay || 0,
      ...options
    });
    console.log(`Email job added: ${job.id}`);
    return job;
  } catch (error) {
    console.error('Error adding email job:', error);
    throw error;
  }
};

const addNotificationJob = async (notificationData, options = {}) => {
  try {
    const job = await notificationQueue.add(notificationData, {
      priority: options.priority || 2,
      delay: options.delay || 0,
      ...options
    });
    console.log(`Notification job added: ${job.id}`);
    return job;
  } catch (error) {
    console.error('Error adding notification job:', error);
    throw error;
  }
};

const addAnalyticsJob = async (analyticsData, options = {}) => {
  try {
    const job = await analyticsQueue.add(analyticsData, {
      priority: options.priority || 3,
      delay: options.delay || 0,
      ...options
    });
    console.log(`Analytics job added: ${job.id}`);
    return job;
  } catch (error) {
    console.error('Error adding analytics job:', error);
    throw error;
  }
};

// Bulk email sending
const addBulkEmailJobs = async (emailsData) => {
  try {
    const jobs = emailsData.map(email => ({
      data: email,
      opts: { priority: 2 }
    }));
    await emailQueue.addBulk(jobs);
    console.log(`Added ${jobs.length} bulk email jobs`);
  } catch (error) {
    console.error('Error adding bulk email jobs:', error);
    throw error;
  }
};

// Scheduled jobs
const scheduleEmailJob = async (emailData, scheduleTime) => {
  const delay = scheduleTime.getTime() - Date.now();
  if (delay < 0) {
    throw new Error('Schedule time must be in the future');
  }

  return await addEmailJob(emailData, { delay });
};

// Get queue stats
const getQueueStats = async (queueName) => {
  const queue = queueName === 'email' ? emailQueue :
                queueName === 'notification' ? notificationQueue :
                analyticsQueue;

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount()
  ]);

  return {
    queue: queueName,
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed
  };
};

// Clean old jobs
const cleanQueue = async (queueName, grace = 86400000) => {
  const queue = queueName === 'email' ? emailQueue :
                queueName === 'notification' ? notificationQueue :
                analyticsQueue;

  await queue.clean(grace, 'completed');
  await queue.clean(grace, 'failed');
  console.log(`Cleaned ${queueName} queue`);
};

// Pause/Resume queues
const pauseQueue = async (queueName) => {
  const queue = queueName === 'email' ? emailQueue :
                queueName === 'notification' ? notificationQueue :
                analyticsQueue;

  await queue.pause();
  console.log(`${queueName} queue paused`);
};

const resumeQueue = async (queueName) => {
  const queue = queueName === 'email' ? emailQueue :
                queueName === 'notification' ? notificationQueue :
                analyticsQueue;

  await queue.resume();
  console.log(`${queueName} queue resumed`);
};

// Graceful shutdown
const closeQueues = async () => {
  await Promise.all([
    emailQueue.close(),
    notificationQueue.close(),
    analyticsQueue.close()
  ]);
  console.log('All queues closed');
};

module.exports = {
  emailQueue,
  notificationQueue,
  analyticsQueue,
  addEmailJob,
  addNotificationJob,
  addAnalyticsJob,
  addBulkEmailJobs,
  scheduleEmailJob,
  getQueueStats,
  cleanQueue,
  pauseQueue,
  resumeQueue,
  closeQueues
};

const redis = require('redis');

let redisClient = null;
let isRedisConnected = false;

// Initialize Redis client
const initializeRedis = async () => {
  try {
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      console.log('⚠️  Redis configuration not found. Caching disabled.');
      return;
    }

    redisClient = redis.createClient({
      url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis: Too many reconnection attempts');
            return new Error('Too many reconnection attempts');
          }
          return retries * 100; // Exponential backoff
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('📦 Redis connected');
      isRedisConnected = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis reconnecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis ready');
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (error) {
    console.error('Redis initialization error:', error.message);
    isRedisConnected = false;
  }
};

// Get value from cache
const get = async (key) => {
  if (!isRedisConnected) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

// Set value in cache with optional TTL (in seconds)
const set = async (key, value, ttl = 3600) => {
  if (!isRedisConnected) {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await redisClient.setEx(key, ttl, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

// Delete key from cache
const del = async (key) => {
  if (!isRedisConnected) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

// Delete multiple keys matching a pattern
const delPattern = async (pattern) => {
  if (!isRedisConnected) {
    return false;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Cache delete pattern error:', error);
    return false;
  }
};

// Check if key exists
const exists = async (key) => {
  if (!isRedisConnected) {
    return false;
  }

  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    console.error('Cache exists error:', error);
    return false;
  }
};

// Set expiration time for a key
const expire = async (key, seconds) => {
  if (!isRedisConnected) {
    return false;
  }

  try {
    await redisClient.expire(key, seconds);
    return true;
  } catch (error) {
    console.error('Cache expire error:', error);
    return false;
  }
};

// Get remaining TTL for a key
const ttl = async (key) => {
  if (!isRedisConnected) {
    return -1;
  }

  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.error('Cache TTL error:', error);
    return -1;
  }
};

// Increment value
const incr = async (key) => {
  if (!isRedisConnected) {
    return 0;
  }

  try {
    return await redisClient.incr(key);
  } catch (error) {
    console.error('Cache incr error:', error);
    return 0;
  }
};

// Decrement value
const decr = async (key) => {
  if (!isRedisConnected) {
    return 0;
  }

  try {
    return await redisClient.decr(key);
  } catch (error) {
    console.error('Cache decr error:', error);
    return 0;
  }
};

// Clear all cache
const flushAll = async () => {
  if (!isRedisConnected) {
    return false;
  }

  try {
    await redisClient.flushAll();
    return true;
  } catch (error) {
    console.error('Cache flush error:', error);
    return false;
  }
};

// Cache middleware for Express routes
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (!isRedisConnected) {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await get(key);

      if (cachedResponse) {
        console.log(`Cache HIT: ${key}`);
        return res.json(cachedResponse);
      }

      console.log(`Cache MISS: ${key}`);

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (body) => {
        set(key, body, duration).catch(err => {
          console.error('Error caching response:', err);
        });
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Predefined cache keys
const CacheKeys = {
  USER_PROFILE: (userId) => `user:profile:${userId}`,
  TASK_DETAILS: (taskId) => `task:details:${taskId}`,
  TASK_LIST: (filters) => `task:list:${JSON.stringify(filters)}`,
  USER_STATS: (userId) => `user:stats:${userId}`,
  PLATFORM_STATS: () => 'platform:stats',
  MARKETPLACE_INSIGHTS: () => 'marketplace:insights',
  POPULAR_SEARCHES: () => 'search:popular',
  TOP_PERFORMERS: () => 'users:top:performers',
  CATEGORY_STATS: () => 'tasks:category:stats',
};

// Cache TTL presets (in seconds)
const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 900,           // 15 minutes
  HOUR: 3600,          // 1 hour
  DAY: 86400,          // 24 hours
  WEEK: 604800,        // 7 days
};

module.exports = {
  initializeRedis,
  get,
  set,
  del,
  delPattern,
  exists,
  expire,
  ttl,
  incr,
  decr,
  flushAll,
  cacheMiddleware,
  CacheKeys,
  CacheTTL,
  isConnected: () => isRedisConnected
};

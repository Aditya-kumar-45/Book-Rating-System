/**
 * @module config/redis
 * @description ioredis client with graceful fallback.
 *              If Redis is unavailable the app continues to work — cache
 *              operations simply become no-ops.
 */

const Redis = require('ioredis');
const config = require('./env');

let client;
let isConnected = false;

try {
  client = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) return null;          // stop retrying after 3 attempts
      return Math.min(times * 200, 2000);  // exponential back-off
    },
    lazyConnect: true,
  });

  client.on('connect', () => {
    isConnected = true;
    console.log('🔴  Connected to Redis');
  });

  client.on('error', (err) => {
    isConnected = false;
    console.warn('🔴  Redis error (non-fatal):', err.message);
  });

  client.on('close', () => {
    isConnected = false;
  });

  // Attempt connection but don't block startup
  client.connect().catch(() => {
    console.warn('🔴  Redis unavailable — caching disabled');
  });
} catch (err) {
  console.warn('🔴  Could not initialise Redis client:', err.message);
}

/* ---- Graceful cache helpers ---- */

/**
 * Get a cached value by key.
 * @param {string} key
 * @returns {Promise<string|null>}
 */
const getCache = async (key) => {
  try {
    if (!isConnected) return null;
    return await client.get(key);
  } catch {
    return null;
  }
};

/**
 * Set a cached value with optional TTL (seconds).
 * @param {string} key
 * @param {string} value
 * @param {number} [ttl] — seconds
 */
const setCache = async (key, value, ttl) => {
  try {
    if (!isConnected) return;
    if (ttl) {
      await client.set(key, value, 'EX', ttl);
    } else {
      await client.set(key, value);
    }
  } catch {
    // silent
  }
};

/**
 * Delete a cached key.
 * @param {string} key
 */
const delCache = async (key) => {
  try {
    if (!isConnected) return;
    await client.del(key);
  } catch {
    // silent
  }
};

module.exports = { client, getCache, setCache, delCache };

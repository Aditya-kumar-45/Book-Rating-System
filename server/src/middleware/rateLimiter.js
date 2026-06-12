/**
 * @module middleware/rateLimiter
 * @description Pre-configured rate limiters for auth and general API routes.
 */

const rateLimit = require('express-rate-limit');

/**
 * Auth limiter — strict rate limit for login / register endpoints.
 * 10 requests per 15-minute window; only failed attempts count.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

/**
 * General API limiter — 100 requests per minute per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after a minute.',
  },
});

module.exports = { authLimiter, apiLimiter };

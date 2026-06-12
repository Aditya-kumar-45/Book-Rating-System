/**
 * @module middleware/auth
 * @description JWT authentication middleware.
 *              Reads the token from the HttpOnly cookie and attaches the
 *              decoded payload to `req.user`.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Mandatory authentication — rejects the request if no valid token is present.
 */
const authenticate = (req, _res, next) => {
  try {
    const token = req.cookies && req.cookies.token;

    if (!token) {
      return next(new AppError('Not authenticated. Please log in.', 401));
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    /** @type {{ id: string, role: string, username: string }} */
    req.user = {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
    };

    next();
  } catch (err) {
    return next(err); // JsonWebTokenError / TokenExpiredError handled globally
  }
};

/**
 * Optional authentication — attaches `req.user` when a valid token exists
 * but does NOT reject the request if the token is missing or invalid.
 */
const optionalAuth = (req, _res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return next();

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
    };
  } catch {
    // Silently ignore — req.user stays undefined
  }
  next();
};

module.exports = { authenticate, optionalAuth };

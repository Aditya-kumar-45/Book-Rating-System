/**
 * @module middleware/rbac
 * @description Role-Based Access Control middleware factory.
 *              Call with allowed roles to produce Express middleware.
 */

const AppError = require('../utils/AppError');

/**
 * Create middleware that restricts access to the given roles.
 * @param {...string} roles - Allowed roles (e.g. 'admin', 'reader')
 * @returns {import('express').RequestHandler}
 */
const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        new AppError('Not authenticated. Please log in first.', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role "${req.user.role}" is not authorised to access this resource. Required: ${roles.join(', ')}.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { authorize };

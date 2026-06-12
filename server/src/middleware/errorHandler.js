/**
 * @module middleware/errorHandler
 * @description Global Express error-handling middleware (4-arg signature).
 *              Normalises various error types into a consistent JSON envelope.
 */

const AppError = require('../utils/AppError');
const { sendError } = require('../utils/response');

/**
 * Global error handler — mount LAST in the middleware stack.
 * @param {Error}  err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
const errorHandler = (err, req, res, _next) => {
  // Ensure we always have a status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log every error (stack only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌  ERROR:', err);
  } else {
    console.error('❌  ERROR:', err.message);
  }

  // ---- Zod validation errors ----
  if (err.name === 'ZodError') {
    const formatted = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return sendError(res, 400, 'Validation failed', formatted);
  }

  // ---- PostgreSQL unique-violation (23505) ----
  if (err.code === '23505') {
    const detail = err.detail || '';
    let field = 'field';
    const match = detail.match(/\(([^)]+)\)/);
    if (match) field = match[1];
    return sendError(res, 409, `Duplicate value for "${field}". Please use another value.`);
  }

  // ---- JWT errors ----
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token. Please log in again.');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired. Please log in again.');
  }

  // ---- Operational (known) errors ----
  if (err instanceof AppError && err.isOperational) {
    return sendError(res, err.statusCode, err.message);
  }

  // ---- Unknown / programming errors ----
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message;

  return sendError(res, err.statusCode, message);
};

module.exports = errorHandler;

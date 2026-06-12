/**
 * @module utils/AppError
 * @description Custom operational error class used throughout the application.
 *              Distinguishes expected (operational) errors from programming bugs.
 */

class AppError extends Error {
  /**
   * @param {string} message  - Human-readable error description
   * @param {number} statusCode - HTTP status code (e.g. 400, 404, 500)
   */
  constructor(message, statusCode) {
    super(message);

    /** @type {number} */
    this.statusCode = statusCode;

    /** @type {'fail'|'error'} 4xx → 'fail', 5xx → 'error' */
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    /** @type {boolean} Operational errors are safe to expose to clients */
    this.isOperational = true;

    // Capture stack trace, excluding this constructor from the trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

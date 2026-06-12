/**
 * @module utils/response
 * @description Standardised JSON response helpers for consistent API output.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {number}  statusCode - HTTP status (200, 201, …)
 * @param {string}  message    - Human-readable success message
 * @param {*}       [data]     - Payload to send
 */
const sendSuccess = (res, statusCode, message, data = null) => {
  const body = { success: true, message };
  if (data !== null && data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {number}  statusCode - HTTP status (400, 404, 500, …)
 * @param {string}  message    - Human-readable error message
 * @param {*}       [errors]   - Optional structured validation / field errors
 */
const sendError = (res, statusCode, message, errors = null) => {
  const body = { success: false, message };
  if (errors !== null && errors !== undefined) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };

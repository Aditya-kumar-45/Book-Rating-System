/**
 * @module features/auth/auth.controller
 * @description Express request handlers for authentication.
 *              Each handler delegates to auth.service and formats the response.
 */

const authService = require('./auth.service');
const config = require('../../config/env');
const { sendSuccess } = require('../../utils/response');

/**
 * POST /register — create a new user account (no auto-login).
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return sendSuccess(res, 201, 'Registration successful', { user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /login — authenticate and set JWT in HttpOnly cookie.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);

    // Set JWT in a secure HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: config.COOKIE_MAX_AGE,
      path: '/',
    });

    return sendSuccess(res, 200, 'Login successful', { user });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /logout — clear the auth cookie.
 */
const logout = async (_req, res, _next) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return sendSuccess(res, 200, 'Logged out successfully');
};

/**
 * GET /me — return the authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return sendSuccess(res, 200, 'Profile retrieved', { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };

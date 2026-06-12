/**
 * @module features/auth/auth.service
 * @description Business logic for user authentication — register, login, profile.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/db');
const config = require('../../config/env');
const AppError = require('../../utils/AppError');

const SALT_ROUNDS = 12;

/**
 * Register a new user.
 * @param {{ username: string, email: string, password: string }} userData
 * @returns {Promise<object>} Created user (without password)
 */
const register = async ({ username, email, password }) => {
  // Check for existing email
  const emailCheck = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (emailCheck.rows.length > 0) {
    throw new AppError('Email is already registered', 409);
  }

  // Check for existing username
  const usernameCheck = await query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );
  if (usernameCheck.rows.length > 0) {
    throw new AppError('Username is already taken', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user
  const result = await query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, role, created_at, updated_at`,
    [username, email, hashedPassword]
  );

  return result.rows[0];
};

/**
 * Authenticate a user and generate a JWT.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
const login = async (email, password) => {
  // Find user by email (include password for comparison)
  const result = await query(
    'SELECT id, username, email, password, role, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = result.rows[0];

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, role: user.role, username: user.username },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  // Strip password from response
  const { password: _pw, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};

/**
 * Fetch a user profile by ID (no password).
 * @param {string} userId - UUID
 * @returns {Promise<object>}
 */
const getProfile = async (userId) => {
  const result = await query(
    'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return result.rows[0];
};

module.exports = { register, login, getProfile };

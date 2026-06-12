/**
 * @module features/auth/auth.schema
 * @description Zod validation schemas for authentication endpoints.
 */

const { z } = require('zod');

/**
 * Registration request body schema.
 * - username: 3-50 chars, alphanumeric only
 * - email: valid email
 * - password: min 8, must have uppercase, lowercase, digit, special char
 */
const registerSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(
      /^[a-zA-Z0-9]+$/,
      'Username must contain only alphanumeric characters'
    ),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character'
    ),
});

/**
 * Login request body schema.
 */
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };

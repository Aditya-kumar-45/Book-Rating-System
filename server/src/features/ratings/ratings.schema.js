/**
 * @module features/ratings/ratings.schema
 * @description Zod validation schemas for rating endpoints.
 */

const { z } = require('zod');

/**
 * Schema for creating a new rating.
 */
const createRatingSchema = z.object({
  score: z
    .number({ required_error: 'Score is required' })
    .int('Score must be an integer')
    .min(1, 'Score must be between 1 and 5')
    .max(5, 'Score must be between 1 and 5'),
  review: z
    .string()
    .max(1000, 'Review must be at most 1000 characters')
    .optional()
    .nullable(),
});

/**
 * Schema for updating an existing rating — all fields optional.
 */
const updateRatingSchema = z.object({
  score: z
    .number()
    .int('Score must be an integer')
    .min(1, 'Score must be between 1 and 5')
    .max(5, 'Score must be between 1 and 5')
    .optional(),
  review: z
    .string()
    .max(1000, 'Review must be at most 1000 characters')
    .optional()
    .nullable(),
});

module.exports = { createRatingSchema, updateRatingSchema };

/**
 * @module features/books/books.schema
 * @description Zod validation schemas for book CRUD endpoints.
 */

const { z } = require('zod');

const currentYear = new Date().getFullYear();

/**
 * Schema for creating a new book.
 */
const createBookSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters'),
  author: z
    .string({ required_error: 'Author is required' })
    .min(1, 'Author is required')
    .max(255, 'Author must be at most 255 characters'),
  isbn: z
    .string()
    .refine((val) => val.length === 10 || val.length === 13, {
      message: 'ISBN must be 10 or 13 characters',
    })
    .optional()
    .nullable(),
  description: z.string().optional().nullable(),
  genre: z.string().max(100, 'Genre must be at most 100 characters').optional().nullable(),
  published_year: z
    .number()
    .int('Published year must be an integer')
    .min(1000, 'Published year must be 1000 or later')
    .max(currentYear, `Published year cannot exceed ${currentYear}`)
    .optional()
    .nullable(),
});

/**
 * Schema for updating a book — all fields optional (partial).
 */
const updateBookSchema = createBookSchema.partial();

/**
 * Schema for book list query params.
 */
const bookQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(Number)
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .default('10')
    .transform(Number)
    .pipe(z.number().int().positive().max(100)),
  search: z.string().optional(),
  genre: z.string().optional(),
});

module.exports = { createBookSchema, updateBookSchema, bookQuerySchema };

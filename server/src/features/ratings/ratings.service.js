/**
 * @module features/ratings/ratings.service
 * @description Business logic for rating CRUD — enforces one-rating-per-user
 *              constraint and ownership checks.
 */

const { query } = require('../../config/db');
const AppError = require('../../utils/AppError');

/**
 * Get all ratings for a specific book, paginated, with user info.
 * @param {string} bookId - UUID
 * @param {{ page?: number, limit?: number }} q
 * @returns {Promise<{ ratings: object[], total: number, page: number, limit: number, totalPages: number }>}
 */
const getByBookId = async (bookId, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;

  // Verify book exists
  const bookCheck = await query('SELECT id FROM books WHERE id = $1', [bookId]);
  if (bookCheck.rows.length === 0) {
    throw new AppError('Book not found', 404);
  }

  // Count
  const countResult = await query(
    'SELECT COUNT(*) FROM ratings WHERE book_id = $1',
    [bookId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Data with user info
  const dataResult = await query(
    `SELECT
       r.id, r.score, r.review, r.created_at, r.updated_at,
       u.id AS user_id, u.username
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.book_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [bookId, limit, offset]
  );

  return {
    ratings: dataResult.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Create a new rating for a book.
 * @param {string} bookId - UUID
 * @param {string} userId - UUID
 * @param {{ score: number, review?: string }} ratingData
 * @returns {Promise<object>}
 */
const create = async (bookId, userId, ratingData) => {
  // Verify book exists
  const bookCheck = await query('SELECT id FROM books WHERE id = $1', [bookId]);
  if (bookCheck.rows.length === 0) {
    throw new AppError('Book not found', 404);
  }

  // Check user hasn't already rated this book
  const existingRating = await query(
    'SELECT id FROM ratings WHERE book_id = $1 AND user_id = $2',
    [bookId, userId]
  );
  if (existingRating.rows.length > 0) {
    throw new AppError('You have already rated this book', 409);
  }

  const { score, review } = ratingData;

  const result = await query(
    `INSERT INTO ratings (book_id, user_id, score, review)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [bookId, userId, score, review || null]
  );

  return result.rows[0];
};

/**
 * Update an existing rating.
 * @param {string} id     - Rating UUID
 * @param {string} userId - Requesting user UUID (ownership check)
 * @param {{ score?: number, review?: string }} ratingData
 * @returns {Promise<object>}
 */
const update = async (id, userId, ratingData) => {
  // Verify rating exists and belongs to user
  const existing = await query(
    'SELECT id, user_id FROM ratings WHERE id = $1',
    [id]
  );
  if (existing.rows.length === 0) {
    throw new AppError('Rating not found', 404);
  }
  if (existing.rows[0].user_id !== userId) {
    throw new AppError('You can only update your own ratings', 403);
  }

  // Build dynamic SET clause
  const fields = [];
  const params = [];
  let paramIdx = 1;

  for (const [key, value] of Object.entries(ratingData)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIdx}`);
      params.push(value);
      paramIdx++;
    }
  }

  if (fields.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  fields.push('updated_at = NOW()');
  params.push(id);

  const result = await query(
    `UPDATE ratings SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    params
  );

  return result.rows[0];
};

/**
 * Delete a rating.
 * @param {string} id     - Rating UUID
 * @param {string} userId - Requesting user UUID
 * @param {string} userRole - Requesting user role (admin can delete any)
 * @returns {Promise<void>}
 */
const deleteRating = async (id, userId, userRole) => {
  const existing = await query(
    'SELECT id, user_id FROM ratings WHERE id = $1',
    [id]
  );
  if (existing.rows.length === 0) {
    throw new AppError('Rating not found', 404);
  }

  // Only the owner or an admin can delete
  if (existing.rows[0].user_id !== userId && userRole !== 'admin') {
    throw new AppError('You can only delete your own ratings', 403);
  }

  await query('DELETE FROM ratings WHERE id = $1', [id]);
};

module.exports = { getByBookId, create, update, delete: deleteRating };

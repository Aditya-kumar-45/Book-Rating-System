/**
 * @module features/books/books.service
 * @description Business logic for book CRUD with average rating aggregation.
 */

const { query } = require('../../config/db');
const AppError = require('../../utils/AppError');

/**
 * Get all books with pagination, search, genre filter, and aggregated ratings.
 * @param {{ page: number, limit: number, search?: string, genre?: string }} q
 * @returns {Promise<{ books: object[], total: number, page: number, limit: number, totalPages: number }>}
 */
const getAll = async ({ page, limit, search, genre }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(
      `(b.title ILIKE $${paramIdx} OR b.author ILIKE $${paramIdx})`
    );
    params.push(`%${search}%`);
    paramIdx++;
  }

  if (genre) {
    conditions.push(`b.genre = $${paramIdx}`);
    params.push(genre);
    paramIdx++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count query
  const countResult = await query(
    `SELECT COUNT(*) FROM books b ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Data query with LEFT JOIN for aggregated ratings
  const dataParams = [...params, limit, offset];
  const dataResult = await query(
    `SELECT
       b.*,
       COALESCE(AVG(r.score), 0)  AS avg_rating,
       COUNT(r.id)::int           AS rating_count
     FROM books b
     LEFT JOIN ratings r ON r.book_id = b.id
     ${whereClause}
     GROUP BY b.id
     ORDER BY b.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    dataParams
  );

  return {
    books: dataResult.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get a single book by ID with rating statistics.
 * @param {string} id - UUID
 * @returns {Promise<object>}
 */
const getById = async (id) => {
  const result = await query(
    `SELECT
       b.*,
       COALESCE(AVG(r.score), 0)  AS avg_rating,
       COUNT(r.id)::int           AS rating_count
     FROM books b
     LEFT JOIN ratings r ON r.book_id = b.id
     WHERE b.id = $1
     GROUP BY b.id`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Book not found', 404);
  }

  return result.rows[0];
};

/**
 * Create a new book.
 * @param {object} bookData
 * @param {string} userId - UUID of the creating admin
 * @returns {Promise<object>}
 */
const create = async (bookData, userId) => {
  const { title, author, isbn, description, genre, published_year } = bookData;

  const result = await query(
    `INSERT INTO books (title, author, isbn, description, genre, published_year, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, author, isbn || null, description || null, genre || null, published_year || null, userId]
  );

  return result.rows[0];
};

/**
 * Update a book by ID.
 * @param {string} id - UUID
 * @param {object} bookData
 * @returns {Promise<object>}
 */
const update = async (id, bookData) => {
  // Verify book exists
  const existing = await query('SELECT id FROM books WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new AppError('Book not found', 404);
  }

  // Build dynamic SET clause
  const fields = [];
  const params = [];
  let paramIdx = 1;

  for (const [key, value] of Object.entries(bookData)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIdx}`);
      params.push(value);
      paramIdx++;
    }
  }

  if (fields.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  fields.push(`updated_at = NOW()`);
  params.push(id);

  const result = await query(
    `UPDATE books SET ${fields.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    params
  );

  return result.rows[0];
};

/**
 * Delete a book by ID.
 * @param {string} id - UUID
 * @returns {Promise<void>}
 */
const deleteBook = async (id) => {
  const result = await query(
    'DELETE FROM books WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Book not found', 404);
  }
};

module.exports = { getAll, getById, create, update, delete: deleteBook };

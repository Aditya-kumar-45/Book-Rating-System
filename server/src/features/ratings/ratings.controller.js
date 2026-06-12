/**
 * @module features/ratings/ratings.controller
 * @description Thin Express controllers for rating endpoints.
 */

const ratingsService = require('./ratings.service');
const { sendSuccess } = require('../../utils/response');

/** GET /books/:bookId/ratings — list ratings for a book */
const getByBookId = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const data = await ratingsService.getByBookId(bookId, req.query);
    return sendSuccess(res, 200, 'Ratings retrieved', data);
  } catch (err) {
    next(err);
  }
};

/** POST /books/:bookId/ratings — create a rating */
const create = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const rating = await ratingsService.create(bookId, req.user.id, req.body);
    return sendSuccess(res, 201, 'Rating created', { rating });
  } catch (err) {
    next(err);
  }
};

/** PUT /books/:bookId/ratings/:id — update a rating */
const update = async (req, res, next) => {
  try {
    const rating = await ratingsService.update(
      req.params.id,
      req.user.id,
      req.body
    );
    return sendSuccess(res, 200, 'Rating updated', { rating });
  } catch (err) {
    next(err);
  }
};

/** DELETE /books/:bookId/ratings/:id — delete a rating */
const deleteRating = async (req, res, next) => {
  try {
    await ratingsService.delete(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, 200, 'Rating deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getByBookId, create, update, delete: deleteRating };

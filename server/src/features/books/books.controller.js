/**
 * @module features/books/books.controller
 * @description Thin Express controllers for book endpoints.
 *              Delegates all logic to books.service.
 */

const booksService = require('./books.service');
const { sendSuccess } = require('../../utils/response');

/** GET / — list all books (paginated, searchable) */
const getAll = async (req, res, next) => {
  try {
    const data = await booksService.getAll(req.query);
    return sendSuccess(res, 200, 'Books retrieved', data);
  } catch (err) {
    next(err);
  }
};

/** GET /:id — single book */
const getById = async (req, res, next) => {
  try {
    const book = await booksService.getById(req.params.id);
    return sendSuccess(res, 200, 'Book retrieved', { book });
  } catch (err) {
    next(err);
  }
};

/** POST / — create book (admin only) */
const create = async (req, res, next) => {
  try {
    const book = await booksService.create(req.body, req.user.id);
    return sendSuccess(res, 201, 'Book created', { book });
  } catch (err) {
    next(err);
  }
};

/** PUT /:id — update book (admin only) */
const update = async (req, res, next) => {
  try {
    const book = await booksService.update(req.params.id, req.body);
    return sendSuccess(res, 200, 'Book updated', { book });
  } catch (err) {
    next(err);
  }
};

/** DELETE /:id — delete book (admin only) */
const deleteBook = async (req, res, next) => {
  try {
    await booksService.delete(req.params.id);
    return sendSuccess(res, 200, 'Book deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, delete: deleteBook };

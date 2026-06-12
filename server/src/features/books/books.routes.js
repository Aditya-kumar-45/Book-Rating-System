/**
 * @module features/books/books.routes
 * @description Express router for book CRUD endpoints.
 *              Public read access; admin-only write access.
 */

const { Router } = require('express');
const controller = require('./books.controller');
const { authenticate, optionalAuth } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const {
  createBookSchema,
  updateBookSchema,
  bookQuerySchema,
} = require('./books.schema');

const router = Router();

/** GET / — list books (public, optional auth) */
router.get(
  '/',
  optionalAuth,
  validate({ query: bookQuerySchema }),
  controller.getAll
);

/** GET /:id — single book (public, optional auth) */
router.get('/:id', optionalAuth, controller.getById);

/** POST / — create book (admin only) */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createBookSchema }),
  controller.create
);

/** PUT /:id — update book (admin only) */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ body: updateBookSchema }),
  controller.update
);

/** DELETE /:id — delete book (admin only) */
router.delete('/:id', authenticate, authorize('admin'), controller.delete);

module.exports = router;

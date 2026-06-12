/**
 * @module features/ratings/ratings.routes
 * @description Express router for rating endpoints.
 *              Mounted under /books so paths look like /books/:bookId/ratings.
 */

const { Router } = require('express');
const controller = require('./ratings.controller');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { validate } = require('../../middleware/validate');
const {
  createRatingSchema,
  updateRatingSchema,
} = require('./ratings.schema');

const router = Router({ mergeParams: true });

/** GET /books/:bookId/ratings — list ratings (public) */
router.get('/:bookId/ratings', controller.getByBookId);

/** POST /books/:bookId/ratings — create rating (reader only) */
router.post(
  '/:bookId/ratings',
  authenticate,
  authorize('reader'),
  validate({ body: createRatingSchema }),
  controller.create
);

/** PUT /books/:bookId/ratings/:id — update rating (owner) */
router.put(
  '/:bookId/ratings/:id',
  authenticate,
  validate({ body: updateRatingSchema }),
  controller.update
);

/** DELETE /books/:bookId/ratings/:id — delete rating (owner or admin) */
router.delete('/:bookId/ratings/:id', authenticate, controller.delete);

module.exports = router;

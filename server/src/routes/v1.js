/**
 * @module routes/v1
 * @description API v1 aggregate router.
 *              Mounts all feature routers under a single /api/v1 namespace.
 */

const { Router } = require('express');

const authRoutes = require('../features/auth/auth.routes');
const bookRoutes = require('../features/books/books.routes');
const ratingRoutes = require('../features/ratings/ratings.routes');

const router = Router();

/** Auth endpoints — /api/v1/auth */
router.use('/auth', authRoutes);

/** Book CRUD endpoints — /api/v1/books */
router.use('/books', bookRoutes);

/** Rating endpoints — /api/v1/books/:bookId/ratings (nested) */
router.use('/books', ratingRoutes);

module.exports = router;

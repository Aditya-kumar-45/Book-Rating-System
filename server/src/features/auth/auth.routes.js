/**
 * @module features/auth/auth.routes
 * @description Express router for authentication endpoints.
 */

const { Router } = require('express');
const controller = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { registerSchema, loginSchema } = require('./auth.schema');

const router = Router();

/** POST /register — create account */
router.post('/register', validate({ body: registerSchema }), controller.register);

/** POST /login — authenticate & receive cookie */
router.post('/login', validate({ body: loginSchema }), controller.login);

/** POST /logout — clear auth cookie (must be logged in) */
router.post('/logout', authenticate, controller.logout);

/** GET /me — retrieve own profile */
router.get('/me', authenticate, controller.getMe);

module.exports = router;

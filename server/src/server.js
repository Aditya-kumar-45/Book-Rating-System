/**
 * @module server
 * @description Application entry point.
 *              Configures Express middleware, mounts routes, and starts listening.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const morgan = require('morgan');
const xssClean = require('xss-clean');

const config = require('./config/env');
const { pool } = require('./config/db');
const v1Router = require('./routes/v1');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const AppError = require('./utils/AppError');
const { sendSuccess } = require('./utils/response');

const app = express();

// ──────────────────────────── Global middleware ────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(hpp());
app.use(morgan('dev'));
app.use(xssClean());

// ──────────────────────────── Rate limiters ────────────────────────────────
app.use('/api', apiLimiter);
app.use('/api/v1/auth', authLimiter);

// ──────────────────────────── Routes ──────────────────────────────────────
app.use('/api/v1', v1Router);

/** Health check */
app.get('/api/health', (_req, res) => {
  return sendSuccess(res, 200, 'Server is healthy', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/** 404 — catch-all for unmatched routes */
app.all('*', (req, _res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl}`, 404));
});

/** Global error handler (must be last) */
app.use(errorHandler);

// ──────────────────────────── Start server ────────────────────────────────
const PORT = config.PORT;

const start = async () => {
  try {
    // Verify DB connection
    await pool.query('SELECT 1');
    console.log('🐘  PostgreSQL connection verified');

    app.listen(PORT, () => {
      console.log(`🚀  Server running on port ${PORT} [${config.NODE_ENV}]`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err.message);
    process.exit(1);
  }
};

start();

module.exports = app; // for testing

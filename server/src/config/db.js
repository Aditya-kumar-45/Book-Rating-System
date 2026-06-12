/**
 * @module config/db
 * @description PostgreSQL connection pool using node-pg.
 *              Exposes a thin query helper that logs connection lifecycle events.
 */

const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

// ---- Lifecycle logging ----
pool.on('connect', () => {
  console.log('🐘  New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('🐘  Unexpected PostgreSQL pool error:', err.message);
});

/**
 * Execute a parameterized SQL query.
 * @param {string} text  - SQL statement with $1, $2 … placeholders
 * @param {any[]}  [params] - Bind parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };

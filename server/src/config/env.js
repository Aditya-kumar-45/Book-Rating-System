/**
 * @module config/env
 * @description Loads and validates environment variables using Zod.
 *              Fails fast if required variables are missing or malformed.
 */

const { z } = require('zod');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root (server/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/** Zod schema for every expected environment variable */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform(Number)
    .pipe(z.number().int().positive()),
  DATABASE_URL: z
    .string()
    .url({ message: 'DATABASE_URL must be a valid PostgreSQL connection string' }),
  JWT_SECRET: z
    .string()
    .min(10, 'JWT_SECRET must be at least 10 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  COOKIE_MAX_AGE: z
    .string()
    .default('900000')
    .transform(Number)
    .pipe(z.number().int().positive()),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

/** @type {z.infer<typeof envSchema>} */
const config = Object.freeze(parsed.data);

module.exports = config;

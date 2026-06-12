/**
 * @module middleware/validate
 * @description Request validation middleware factory.
 *              Accepts a schema object with optional `body`, `params`, and
 *              `query` Zod schemas and validates the corresponding parts of
 *              the request.
 */

const { sendError } = require('../utils/response');

/**
 * Create Express middleware that validates parts of the incoming request.
 *
 * @param {{ body?: import('zod').ZodSchema, params?: import('zod').ZodSchema, query?: import('zod').ZodSchema }} schema
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   router.post('/', validate({ body: createBookSchema }), controller.create);
 */
const validate = (schema) => {
  return (req, res, next) => {
    /** @type {{ field: string, message: string }[]} */
    const errors = [];

    for (const source of ['body', 'params', 'query']) {
      if (!schema[source]) continue;

      const result = schema[source].safeParse(req[source]);

      if (!result.success) {
        result.error.issues.forEach((issue) => {
          errors.push({
            field: `${source}.${issue.path.join('.')}`,
            message: issue.message,
          });
        });
      } else {
        // Replace the raw value with the parsed (coerced / defaulted) value
        req[source] = result.data;
      }
    }

    if (errors.length > 0) {
      return sendError(res, 400, 'Validation failed', errors);
    }

    next();
  };
};

module.exports = { validate };

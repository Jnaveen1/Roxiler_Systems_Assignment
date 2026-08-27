const { ZodError } = require('zod');
const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 400, 'Validation Error', formattedErrors);
  }

  // Prisma Unique Constraint Violation
  if (err.code === 'P2002') {
    const fields = err.meta?.target || [];
    return sendError(
      res,
      400,
      `A record with this ${Array.isArray(fields) ? fields.join(', ') : 'field'} already exists`,
      [{ field: Array.isArray(fields) ? fields.join(', ') : 'field', message: 'Already exists' }]
    );
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, statusCode, message);
};

module.exports = errorHandler;

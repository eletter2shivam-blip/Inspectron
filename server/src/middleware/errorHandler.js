/**
 * Centralized Application Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  // Structured log for observability
  console.error(`[ERROR] [${req.method}] ${req.originalUrl || req.url}:`, {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'test' ? undefined : err.stack
  });

  const statusCode = err.statusCode || err.status || (err.name === 'ZodError' ? 400 : 500);
  const code = err.code || (err.name === 'ZodError' ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected error occurred. Please try again.';
  const details = err.errors || err.details || [];

  return res.status(statusCode).json({
    success: false,
    message, // convenience for legacy frontend
    error: {
      code,
      message,
      details: Array.isArray(details) ? details : [details]
    }
  });
}

module.exports = errorHandler;

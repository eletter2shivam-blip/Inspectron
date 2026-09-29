// In-memory token bucket / sliding window rate limiter
const requestCounts = new Map();

// Periodic cleanup of expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 60000) {
      requestCounts.delete(key);
    }
  }
}, 300000);

/**
 * Creates a rate limiting middleware based on user role and client IP.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default 1 minute)
 * @param {number} options.max - Default maximum requests per window
 * @param {string} options.operationName - Name of the operation for logging
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60000;
  const baseMax = options.max || 60;
  const operationName = options.operationName || 'request';

  return (req, res, next) => {
    // In test environment, do not throttle
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const identifier = req.user?.id || req.ip || 'anonymous';
    const key = `${operationName}:${identifier}`;
    const now = Date.now();

    // Determine multiplier by role
    let roleMultiplier = 1;
    const role = (req.user?.role || '').toLowerCase();
    if (role === 'admin') roleMultiplier = 5;
    else if (role === 'qa_lead') roleMultiplier = 3;
    else if (role === 'senior_qa' || role === 'qa_engineer') roleMultiplier = 2;
    else if (role === 'viewer') roleMultiplier = 0.5;

    const maxAllowed = Math.max(5, Math.floor(baseMax * roleMultiplier));

    let record = requestCounts.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      requestCounts.set(key, record);
    }

    record.count += 1;

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', maxAllowed);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxAllowed - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxAllowed) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests for ${operationName}. Please wait before retrying.`,
          details: [{ max: maxAllowed, resetSeconds: Math.ceil((record.resetTime - now) / 1000) }]
        }
      });
    }

    next();
  };
}

// Preset rate limiters for expensive operations
const aiRateLimiter = createRateLimiter({ windowMs: 60000, max: 20, operationName: 'ai_generation' });
const executionRateLimiter = createRateLimiter({ windowMs: 60000, max: 30, operationName: 'api_execution' });
const jiraRateLimiter = createRateLimiter({ windowMs: 60000, max: 20, operationName: 'jira_sync' });

module.exports = {
  createRateLimiter,
  aiRateLimiter,
  executionRateLimiter,
  jiraRateLimiter
};

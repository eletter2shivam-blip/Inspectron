/**
 * Middleware that attaches standardized response methods to the Express res object.
 */
function responseHandler(req, res, next) {
  /**
   * Send a standardized success response.
   * Format: { success: true, data: ..., message: '...' }
   * Also merges data fields at top-level for 100% backward compatibility with existing UI.
   */
  res.success = function(data = {}, message = 'Operation successful', statusCode = 200) {
    const payload = {
      success: true,
      message,
      data
    };

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(payload, data);
    }

    return res.status(statusCode).json(payload);
  };

  /**
   * Send a standardized error response.
   * Format: { success: false, error: { code, message, details } }
   */
  res.fail = function(code = 'INTERNAL_ERROR', message = 'An error occurred', details = [], statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      message, // legacy convenience
      error: {
        code,
        message,
        details: Array.isArray(details) ? details : [details]
      }
    });
  };

  next();
}

module.exports = responseHandler;

const db = require('../db/database');

/**
 * Audit Logger Middleware
 * Captures mutations and critical security events to audit_logs collection
 */
function logAudit(action, entity, getEntityId = (req) => req.params.id || null, getDetails = (req) => null) {
  return (req, res, next) => {
    // Intercept finish event to ensure status code is 2xx
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const entityId = typeof getEntityId === 'function' ? getEntityId(req) : req.params.id;
          const details = typeof getDetails === 'function' ? getDetails(req) : JSON.stringify(req.body).slice(0, 300);

          db.insert('audit_logs', {
            user_id: req.user ? req.user.id : 'anonymous',
            action,
            entity,
            entity_id: entityId || 'N/A',
            details: details || `${action} on ${entity}`,
            ip_address: req.ip || req.connection.remoteAddress || '127.0.0.1'
          });
        } catch (e) {
          console.warn('Failed to record audit log:', e.message);
        }
      }
    });

    next();
  };
}

module.exports = { logAudit };

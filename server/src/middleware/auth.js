const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'ai-qa-assistant-secure-jwt-key-2026';

/**
 * Authentication Middleware: Validates Bearer JWT Token
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication token missing or invalid format.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findById('users', decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'The user account associated with this token no longer exists.'
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title
    };
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Token has expired or signature is invalid.'
    });
  }
}

/**
 * Optional Authentication: Attaches verified user if token provided,
 * otherwise sets standard QA Lead user context so playground actions succeed.
 */
function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.findById('users', decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title
        };
        return next();
      }
    } catch (err) {
      // Token expired or invalid, fall back to guest demo user below
    }
  }

  const defaultUser = db.findOne('users', { role: 'qa_lead' }) || {
    id: 'usr-lead-01',
    name: 'Sarah Connor',
    email: 'lead@inspectron.io',
    role: 'qa_lead',
    title: 'Principal QA Architect'
  };
  req.user = defaultUser;
  next();
}
 * Role-Based Access Control (RBAC) Middleware
 * Hierarchy: qa_lead > senior_qa > qa_engineer > viewer
 */
const ROLE_WEIGHTS = {
  viewer: 1,
  qa_engineer: 2,
  senior_qa: 3,
  qa_lead: 4
};

function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const userWeight = ROLE_WEIGHTS[req.user.role] || 1;
    const requiredWeight = ROLE_WEIGHTS[minRole] || 1;

    if (userWeight < requiredWeight) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Action requires ${minRole} privilege level. Your current role is ${req.user.role}.`
      });
    }

    next();
  };
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireRole,
  generateToken,
  JWT_SECRET
};

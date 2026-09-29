const db = require('../db/database');

const ROLE_PERMISSIONS = {
  admin: ['*'],
  qa_lead: [
    'PROJECT_VIEW', 'PROJECT_CREATE', 'PROJECT_UPDATE', 'PROJECT_DELETE',
    'REQUIREMENT_VIEW', 'REQUIREMENT_ANALYZE', 'REQUIREMENT_CREATE', 'REQUIREMENT_UPDATE', 'REQUIREMENT_DELETE',
    'TESTCASE_VIEW', 'TESTCASE_CREATE', 'TESTCASE_UPDATE', 'TESTCASE_DELETE', 'TESTCASE_APPROVE',
    'API_TEST_CREATE', 'API_TEST_EXECUTE', 'API_TEST_DELETE',
    'BUG_ANALYZE', 'REGRESSION_ANALYZE', 'TEST_EXECUTE', 'REPORT_VIEW',
    'AI_GENERATE', 'JIRA_CONNECT', 'JIRA_CONFIGURE', 'AUDIT_VIEW',
    'SETTINGS_UPDATE', 'PROMPT_UPDATE', 'PROMPT_CREATE'
  ],
  senior_qa: [
    'PROJECT_VIEW',
    'REQUIREMENT_VIEW', 'REQUIREMENT_ANALYZE', 'REQUIREMENT_CREATE', 'REQUIREMENT_UPDATE',
    'TESTCASE_VIEW', 'TESTCASE_CREATE', 'TESTCASE_UPDATE', 'TESTCASE_APPROVE',
    'API_TEST_CREATE', 'API_TEST_EXECUTE',
    'BUG_ANALYZE', 'REGRESSION_ANALYZE', 'TEST_EXECUTE', 'REPORT_VIEW',
    'AI_GENERATE'
  ],
  qa_engineer: [
    'PROJECT_VIEW',
    'REQUIREMENT_VIEW', 'REQUIREMENT_ANALYZE', 'REQUIREMENT_CREATE', 'REQUIREMENT_UPDATE',
    'TESTCASE_VIEW', 'TESTCASE_CREATE', 'TESTCASE_UPDATE',
    'API_TEST_CREATE', 'API_TEST_EXECUTE',
    'BUG_ANALYZE', 'REGRESSION_ANALYZE', 'TEST_EXECUTE', 'REPORT_VIEW',
    'AI_GENERATE'
  ],
  developer: [
    'PROJECT_VIEW',
    'REQUIREMENT_VIEW', 'REQUIREMENT_ANALYZE',
    'TESTCASE_VIEW', 'TESTCASE_CREATE',
    'API_TEST_CREATE', 'API_TEST_EXECUTE',
    'BUG_ANALYZE', 'REPORT_VIEW'
  ],
  viewer: [
    'PROJECT_VIEW', 'REQUIREMENT_VIEW', 'TESTCASE_VIEW', 'REPORT_VIEW'
  ]
};

/**
 * Normalizes role string to canonical lookup key (e.g. QA_LEAD -> qa_lead)
 */
function normalizeRole(role) {
  if (!role) return 'viewer';
  return role.toLowerCase().replace('-', '_');
}

function normalizePermission(p) {
  if (!p) return '';
  let str = p.toUpperCase().replace(/[:\-]/g, '_');
  str = str.replace('TESTCASES_', 'TESTCASE_')
           .replace('PROJECTS_', 'PROJECT_')
           .replace('REQUIREMENTS_', 'REQUIREMENT_')
           .replace('API_TESTS_', 'API_TEST_');
  return str;
}

/**
 * Middleware that checks if the authenticated user has a specific permission.
 * @param {string} permission - The required permission code (e.g. 'TESTCASE_APPROVE' or 'testcases:approve')
 */
function requirePermission(permission) {
  const normPerm = normalizePermission(permission);
  return (req, res, next) => {
    // If not authenticated, reject
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const userRole = normalizeRole(req.user.role);
    if (userRole === 'admin') {
      return next();
    }

    const permissions = ROLE_PERMISSIONS[userRole] || [];
    if (permissions.includes('*')) {
      return next();
    }

    if (!permissions.includes(normPerm) && !permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Forbidden: User role "${req.user.role}" lacks "${permission}" permission`
        }
      });
    }

    next();
  };
}

/**
 * Middleware that verifies project data isolation.
 * Ensures that the authenticated user has access to the project specified in params/body/query.
 */
function requireProjectAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  // Admin and QA Lead have global project access
  const userRole = normalizeRole(req.user.role);
  if (['admin', 'qa_lead'].includes(userRole)) {
    return next();
  }

  const projectId = req.params.projectId || req.params.id || req.body?.project_id || req.query?.projectId;
  if (!projectId) {
    return next(); // Not a project-specific route
  }

  // Check project membership in DB
  const member = db.findOne('project_members', { project_id: projectId, user_id: req.user.id });
  const project = db.findById('projects', projectId);

  if (project && project.owner_id === req.user.id) {
    return next();
  }

  // If project is marked as public or demo project, allow read access
  if (project && (project.is_demo || project.id === 'proj-inspectron-01')) {
    return next();
  }

  if (!member) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: `Tenant Isolation Error: You are not a member of project ${projectId}`
      }
    });
  }

  next();
}

module.exports = {
  ROLE_PERMISSIONS,
  requirePermission,
  checkPermission: requirePermission,
  requireProjectAccess
};

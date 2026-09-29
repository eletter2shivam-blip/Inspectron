const db = require('../db/database');
const QAHealthEngine = require('../services/QAHealthEngine');

/**
 * Returns comprehensive aggregated statistics for the project dashboard.
 * Every metric is derived 100% dynamically from normalized database entities.
 */
exports.getDashboardStats = (req, res, next) => {
  try {
    const { projectId } = req.query;
    const projectFilter = projectId ? { project_id: projectId } : null;

    // Entity Counts
    const totalProjects = db.count('projects');
    const requirements = db.find('requirements', projectFilter);
    const testCases = db.find('test_cases', projectFilter);
    const regressionTests = db.find('regression_tests', projectFilter);
    const apiTests = db.find('api_tests', projectFilter);
    const bugs = db.find('bugs', projectFilter);
    const edgeCases = db.find('edge_cases', projectFilter);

    // Calculate real dynamic health metrics & coverage
    const healthReport = QAHealthEngine.calculateProjectHealth(projectId);

    // Dynamic Distribution Counts
    const typeCounts = {};
    const priorityCounts = { 'P1-Critical': 0, 'P2-High': 0, 'P3-Medium': 0, 'P4-Low': 0 };
    const moduleCounts = {};

    testCases.forEach(tc => {
      const type = tc.test_type || 'Functional';
      typeCounts[type] = (typeCounts[type] || 0) + 1;

      const prio = tc.priority || 'P2-High';
      priorityCounts[prio] = (priorityCounts[prio] || 0) + 1;

      const mod = tc.module || 'General';
      moduleCounts[mod] = (moduleCounts[mod] || 0) + 1;
    });

    // Recent Activity & Audit Logs
    const recentLogs = db.find('audit_logs', null, { created_at: 'desc' }, { page: 1, limit: 10 }).items || [];

    // Recent Test Cases
    const recentTestCases = db.find('test_cases', projectFilter, { created_at: 'desc' }, { page: 1, limit: 6 }).items || [];

    const statsPayload = {
      totalProjects,
      totalRequirements: requirements.length,
      totalTestCases: testCases.length,
      regressionTestCases: regressionTests.length,
      apiTestCases: apiTests.length,
      bugsAnalyzed: bugs.length,
      edgeCasesIdentified: edgeCases.length,
      testCoveragePercentage: healthReport.breakdown.requirementCoveragePct,
      qaHealthScore: healthReport.healthScore,
      qaHealthStatus: healthReport.status
    };

    const chartsPayload = {
      testTypes: Object.entries(typeCounts).map(([name, count]) => ({ name, count })),
      priorities: Object.entries(priorityCounts).map(([name, count]) => ({ name, count })),
      modules: Object.entries(moduleCounts).map(([name, count]) => ({ name, count }))
    };

    if (res.success) {
      return res.success({
        stats: statsPayload,
        charts: chartsPayload,
        healthReport,
        recentActivities: recentLogs,
        recentTestCases
      }, 'Dashboard statistics retrieved');
    }

    // Direct JSON fallback
    return res.json({
      success: true,
      stats: statsPayload,
      charts: chartsPayload,
      healthReport,
      recentActivities: recentLogs,
      recentTestCases
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/summary
 */
exports.getSummary = (req, res, next) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { project_id: projectId } : null;

    const health = QAHealthEngine.calculateProjectHealth(projectId);

    const summary = {
      requirementsAnalyzed: db.count('requirements', filter),
      totalTestCases: db.count('test_cases', filter),
      regressionTests: db.count('regression_tests', filter),
      apiScenarios: db.count('api_tests', filter),
      bugsDiagnosed: db.count('bugs', filter),
      edgeCasesFound: db.count('edge_cases', filter),
      testCoverage: health.breakdown.requirementCoveragePct,
      activeProjects: db.count('projects', { status: 'ACTIVE' }) || db.count('projects'),
      healthScore: health.healthScore
    };

    if (res.success) return res.success(summary, 'Dashboard summary retrieved');
    return res.json({ success: true, ...summary });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/test-type-breakdown
 */
exports.getTestTypeBreakdown = (req, res, next) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { project_id: projectId } : null;
    const data = db.groupBy('test_cases', 'test_type', filter);
    if (res.success) return res.success({ types: data }, 'Test type breakdown retrieved');
    return res.json({ success: true, types: data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/priority-distribution
 */
exports.getPriorityDistribution = (req, res, next) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { project_id: projectId } : null;
    const data = db.groupBy('test_cases', 'priority', filter);
    if (res.success) return res.success({ priorities: data }, 'Priority distribution retrieved');
    return res.json({ success: true, priorities: data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/module-test-volume
 */
exports.getModuleTestVolume = (req, res, next) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { project_id: projectId } : null;
    const data = db.groupBy('test_cases', 'module', filter);
    if (res.success) return res.success({ modules: data }, 'Module test volume retrieved');
    return res.json({ success: true, modules: data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/coverage
 */
exports.getCoverage = (req, res, next) => {
  try {
    const { projectId } = req.query;
    const health = QAHealthEngine.calculateProjectHealth(projectId);
    if (res.success) return res.success(health, 'Project coverage retrieved');
    return res.json({ success: true, ...health });
  } catch (err) {
    next(err);
  }
};

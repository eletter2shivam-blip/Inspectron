const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const projectController = require('../controllers/projectController');
const requirementController = require('../controllers/requirementController');
const testCaseController = require('../controllers/testCaseController');
const regressionController = require('../controllers/regressionController');
const apiTestController = require('../controllers/apiTestController');
const edgeCaseController = require('../controllers/edgeCaseController');
const testDataController = require('../controllers/testDataController');
const bugController = require('../controllers/bugController');
const coverageController = require('../controllers/coverageController');
const jiraController = require('../controllers/jiraController');
const historyController = require('../controllers/historyController');
const promptController = require('../controllers/promptController');
const exportController = require('../controllers/exportController');
const settingsController = require('../controllers/settingsController');
const jobController = require('../controllers/jobController');
const docsController = require('../controllers/docsController');
const pretureController = require('../controllers/pretureController');

const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { logAudit } = require('../middleware/auditLogger');
const { checkPermission, requireProjectAccess } = require('../middleware/rbac');

// 0. API Documentation (OpenAPI 3.0)
router.get('/docs', docsController.getOpenApiDocs);
router.get('/openapi.json', docsController.getOpenApiDocs);

// 1. Auth routes (public)
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/me', authenticate, authController.getCurrentUser);

// 2. Dashboard Analytics (Dynamic & Normalized)
router.get('/dashboard/stats', dashboardController.getDashboardStats);
router.get('/dashboard/summary', dashboardController.getSummary);
router.get('/dashboard/test-type-breakdown', dashboardController.getTestTypeBreakdown);
router.get('/dashboard/priority-distribution', dashboardController.getPriorityDistribution);
router.get('/dashboard/module-volume', dashboardController.getModuleTestVolume);
router.get('/dashboard/coverage', dashboardController.getCoverage);

// 3. Projects
router.get('/projects', projectController.getProjects);
router.post('/projects', authenticate, checkPermission('projects:create'), logAudit('CREATE_PROJECT', 'Project'), projectController.createProject);
router.get('/projects/:id', projectController.getProjectById);
router.put('/projects/:id', authenticate, checkPermission('projects:update'), logAudit('UPDATE_PROJECT', 'Project'), projectController.updateProject);
router.delete('/projects/:id', authenticate, checkPermission('projects:delete'), logAudit('DELETE_PROJECT', 'Project'), projectController.deleteProject);
router.post('/projects/reset-demo', authenticate, checkPermission('projects:create'), logAudit('RESET_DEMO_DATA', 'Project'), projectController.resetDemoData);

// 4. Requirements & Requirements Analyzer (v1 and standard endpoints)
router.get(['/requirements/samples', '/v1/requirements/samples'], requirementController.getSamples);
router.get(['/requirements/analyses', '/v1/requirements/analyses'], requirementController.getAnalyses);
router.get(['/requirements/analyses/:id', '/v1/requirements/analyses/:id'], requirementController.getAnalysisById);
router.delete(['/requirements/analyses/:id', '/v1/requirements/analyses/:id'], optionalAuthenticate, logAudit('DELETE_ANALYSIS', 'RequirementAnalysis'), requirementController.deleteAnalysis);
router.get(['/requirements/analyses/:id/export', '/v1/requirements/analyses/:id/export'], requirementController.exportAnalysis);

router.post(['/requirements/analyze', '/v1/requirements/analyze'], optionalAuthenticate, logAudit('ANALYZE_REQUIREMENT', 'Requirement'), requirementController.analyzeRequirement);
router.get(['/requirements', '/v1/requirements'], requirementController.getRequirements);
router.get(['/requirements/:id', '/v1/requirements/:id'], requirementController.getRequirementById);
router.put(['/requirements/:id', '/v1/requirements/:id'], optionalAuthenticate, logAudit('UPDATE_REQUIREMENT', 'Requirement'), requirementController.updateRequirement);
router.delete(['/requirements/:id', '/v1/requirements/:id'], optionalAuthenticate, logAudit('DELETE_REQUIREMENT', 'Requirement'), requirementController.deleteRequirement);

// 4b. Preture Dashboard — Retail & Store Performance Analytics
router.get(['/preture/filters', '/preture-dashboard/filters'], pretureController.getFilters);
router.get(['/preture/summary', '/preture-dashboard/summary'], pretureController.getSummary);
router.get(['/preture/insights', '/preture-dashboard/insights'], pretureController.getInsights);
router.get(['/preture/sales-trend', '/preture-dashboard/sales-trend'], pretureController.getSalesTrend);
router.get(['/preture/store-performance', '/preture-dashboard/store-performance'], pretureController.getStorePerformance);
router.get(['/preture/billing', '/preture-dashboard/billing'], pretureController.getBilling);
router.get(['/preture/recent-sales', '/preture-dashboard/recent-sales'], pretureController.getRecentSales);
router.get(['/preture/export-csv', '/preture-dashboard/export-csv'], pretureController.exportCsv);

// 5. Test Cases & Versioning
router.get('/testcases', testCaseController.getTestCases);
router.post('/testcases/generate', authenticate, checkPermission('testcases:create'), logAudit('GENERATE_TEST_CASES', 'TestCase'), testCaseController.generateTestCases);
router.post('/testcases', authenticate, checkPermission('testcases:create'), logAudit('CREATE_TEST_CASE', 'TestCase'), testCaseController.createTestCase);
router.get('/testcases/:id', testCaseController.getTestCaseById);
router.put('/testcases/:id', authenticate, checkPermission('testcases:update'), logAudit('UPDATE_TEST_CASE', 'TestCase'), testCaseController.updateTestCase);
router.delete('/testcases/:id', authenticate, checkPermission('testcases:delete'), logAudit('DELETE_TEST_CASE', 'TestCase'), testCaseController.deleteTestCase);
router.post('/testcases/:id/duplicate', authenticate, checkPermission('testcases:create'), logAudit('DUPLICATE_TEST_CASE', 'TestCase'), testCaseController.duplicateTestCase);
router.post('/testcases/bulk-status', authenticate, checkPermission('testcases:approve'), logAudit('BULK_STATUS_UPDATE', 'TestCase'), testCaseController.bulkUpdateStatus);
router.post('/testcases/audit-quality', testCaseController.auditQuality);

// Test Case Versions & Lifecycle
router.get('/testcases/:id/versions', testCaseController.getTestCaseVersions);
router.post('/testcases/:id/approve', authenticate, checkPermission('testcases:approve'), logAudit('APPROVE_TEST_CASE', 'TestCase'), testCaseController.approveTestCase);
router.post('/testcases/:id/reject', authenticate, checkPermission('testcases:approve'), logAudit('REJECT_TEST_CASE', 'TestCase'), testCaseController.rejectTestCase);
router.post('/testcases/:id/archive', authenticate, checkPermission('testcases:delete'), logAudit('ARCHIVE_TEST_CASE', 'TestCase'), testCaseController.archiveTestCase);
router.post('/testcases/:id/restore', authenticate, checkPermission('testcases:update'), logAudit('RESTORE_TEST_CASE', 'TestCase'), testCaseController.restoreTestCase);

// 6. Regression Tests
router.get('/regression', regressionController.getRegressionTests);
router.post('/regression/generate', authenticate, checkPermission('testcases:create'), logAudit('GENERATE_REGRESSION_TESTS', 'RegressionTest'), regressionController.generateRegressionTests);
router.delete('/regression/:id', authenticate, checkPermission('testcases:delete'), logAudit('DELETE_REGRESSION_TEST', 'RegressionTest'), regressionController.deleteRegressionTest);

// 7. API Tests & Live Execution Engine
router.get('/api-tests', apiTestController.getApiTests);
router.post('/api-tests/generate', authenticate, checkPermission('api_tests:create'), logAudit('GENERATE_API_TESTS', 'ApiTest'), apiTestController.generateApiTests);
router.delete('/api-tests/:id', authenticate, checkPermission('api_tests:delete'), logAudit('DELETE_API_TEST', 'ApiTest'), apiTestController.deleteApiTest);
router.get('/api-tests/export/postman', apiTestController.exportPostmanCollection);
router.post('/api-tests/:id/execute', authenticate, checkPermission('api_tests:execute'), logAudit('EXECUTE_API_TEST', 'ApiTest'), apiTestController.executeTestCase);
router.post('/api-tests/execute-all', authenticate, checkPermission('api_tests:execute'), logAudit('EXECUTE_ALL_API_TESTS', 'ApiTest'), apiTestController.executeAll);
router.get('/api-tests/:id/executions', apiTestController.getExecutions);

// 8. Edge Cases
router.post('/edge-cases/analyze', authenticate, checkPermission('testcases:create'), logAudit('ANALYZE_EDGE_CASES', 'EdgeCase'), edgeCaseController.analyzeEdgeCases);
router.post('/edge-cases/promote', authenticate, checkPermission('testcases:create'), logAudit('PROMOTE_EDGE_CASE', 'TestCase'), edgeCaseController.promoteToTestCase);

// 9. Test Data
router.get('/test-data/sets', testDataController.getTestDataSets);
router.post('/test-data/generate', authenticate, checkPermission('testcases:create'), logAudit('GENERATE_TEST_DATA', 'TestDataSet'), testDataController.generateTestData);
router.get('/test-data/export', testDataController.exportTestData);

// 10. Bugs
router.get('/bugs', bugController.getBugs);
router.post('/bugs/analyze', authenticate, checkPermission('testcases:create'), logAudit('ANALYZE_BUG', 'Bug'), bugController.analyzeBug);
router.get('/bugs/:id', bugController.getBugById);
router.delete('/bugs/:id', authenticate, checkPermission('testcases:delete'), logAudit('DELETE_BUG', 'Bug'), bugController.deleteBug);

// 11. Traceability & Coverage Matrix
router.get('/coverage/matrix', coverageController.getCoverageMatrix);

// 12. Jira Integration
router.get('/jira/config', jiraController.getConfig);
router.post('/jira/config', authenticate, checkPermission('jira:configure'), logAudit('UPDATE_JIRA_CONFIG', 'JiraConfig'), jiraController.saveConfig);
router.get('/jira/issues/search', jiraController.searchIssues);
router.get('/jira/issues/:issueKey', jiraController.getIssueById);
router.post('/jira/issues/:issueKey/generate-tests', authenticate, checkPermission('testcases:create'), logAudit('JIRA_GENERATE_TESTS', 'TestCase'), jiraController.generateTestsFromIssue);

// 13. AI History
router.get('/history', historyController.getHistory);
router.get('/history/:id', historyController.getHistoryById);
router.delete('/history', authenticate, checkPermission('settings:update'), logAudit('CLEAR_HISTORY', 'AIHistory'), historyController.clearHistory);

// 14. Prompt Versions
router.get('/prompts', promptController.getPromptVersions);
router.put('/prompts/:id', authenticate, checkPermission('prompts:update'), logAudit('UPDATE_PROMPT', 'PromptVersion'), promptController.updatePromptVersion);
router.post('/prompts', authenticate, checkPermission('prompts:create'), logAudit('CREATE_PROMPT', 'PromptVersion'), promptController.createPromptVersion);

// 15. Export & Automation Scripts
router.get('/export/testcases', exportController.exportTestCases);
router.post('/export/script', exportController.generateAutomationScript);

// 16. Asynchronous Background Jobs
router.get('/jobs', jobController.listJobs);
router.get('/jobs/:id', jobController.getJobStatus);
router.post('/jobs/:id/cancel', authenticate, jobController.cancelJob);

// 17. Settings & Audit Logs
router.get('/settings', settingsController.getSettings);
router.post('/settings', authenticate, checkPermission('settings:update'), logAudit('UPDATE_SETTINGS', 'Settings'), settingsController.updateSettings);
router.get('/settings/audit-logs', settingsController.getAuditLogs);

module.exports = router;

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

const { authenticate } = require('../middleware/auth');
const { logAudit } = require('../middleware/auditLogger');

// 1. Auth routes (public)
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/me', authenticate, authController.getCurrentUser);

// 2. Dashboard
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// 3. Projects
router.get('/projects', projectController.getProjects);
router.post('/projects', authenticate, logAudit('CREATE_PROJECT', 'Project'), projectController.createProject);
router.get('/projects/:id', projectController.getProjectById);
router.put('/projects/:id', authenticate, logAudit('UPDATE_PROJECT', 'Project'), projectController.updateProject);
router.delete('/projects/:id', authenticate, logAudit('DELETE_PROJECT', 'Project'), projectController.deleteProject);
router.post('/projects/reset-demo', authenticate, logAudit('RESET_DEMO_DATA', 'Project'), projectController.resetDemoData);

// 4. Requirements
router.get('/requirements', requirementController.getRequirements);
router.post('/requirements/analyze', authenticate, logAudit('ANALYZE_REQUIREMENT', 'Requirement'), requirementController.analyzeRequirement);
router.get('/requirements/:id', requirementController.getRequirementById);
router.put('/requirements/:id', authenticate, logAudit('UPDATE_REQUIREMENT', 'Requirement'), requirementController.updateRequirement);
router.delete('/requirements/:id', authenticate, logAudit('DELETE_REQUIREMENT', 'Requirement'), requirementController.deleteRequirement);

// 5. Test Cases
router.get('/testcases', testCaseController.getTestCases);
router.post('/testcases/generate', authenticate, logAudit('GENERATE_TEST_CASES', 'TestCase'), testCaseController.generateTestCases);
router.post('/testcases', authenticate, logAudit('CREATE_TEST_CASE', 'TestCase'), testCaseController.createTestCase);
router.get('/testcases/:id', testCaseController.getTestCaseById);
router.put('/testcases/:id', authenticate, logAudit('UPDATE_TEST_CASE', 'TestCase'), testCaseController.updateTestCase);
router.delete('/testcases/:id', authenticate, logAudit('DELETE_TEST_CASE', 'TestCase'), testCaseController.deleteTestCase);
router.post('/testcases/:id/duplicate', authenticate, logAudit('DUPLICATE_TEST_CASE', 'TestCase'), testCaseController.duplicateTestCase);
router.post('/testcases/bulk-status', authenticate, logAudit('BULK_STATUS_UPDATE', 'TestCase'), testCaseController.bulkUpdateStatus);
router.post('/testcases/audit-quality', testCaseController.auditQuality);

// 6. Regression Tests
router.get('/regression', regressionController.getRegressionTests);
router.post('/regression/generate', authenticate, logAudit('GENERATE_REGRESSION_TESTS', 'RegressionTest'), regressionController.generateRegressionTests);
router.delete('/regression/:id', authenticate, logAudit('DELETE_REGRESSION_TEST', 'RegressionTest'), regressionController.deleteRegressionTest);

// 7. API Tests
router.get('/api-tests', apiTestController.getApiTests);
router.post('/api-tests/generate', authenticate, logAudit('GENERATE_API_TESTS', 'ApiTest'), apiTestController.generateApiTests);
router.delete('/api-tests/:id', authenticate, logAudit('DELETE_API_TEST', 'ApiTest'), apiTestController.deleteApiTest);
router.get('/api-tests/export/postman', apiTestController.exportPostmanCollection);

// 8. Edge Cases
router.post('/edge-cases/analyze', authenticate, logAudit('ANALYZE_EDGE_CASES', 'EdgeCase'), edgeCaseController.analyzeEdgeCases);
router.post('/edge-cases/promote', authenticate, logAudit('PROMOTE_EDGE_CASE', 'TestCase'), edgeCaseController.promoteToTestCase);

// 9. Test Data
router.get('/test-data/sets', testDataController.getTestDataSets);
router.post('/test-data/generate', authenticate, logAudit('GENERATE_TEST_DATA', 'TestDataSet'), testDataController.generateTestData);
router.get('/test-data/export', testDataController.exportTestData);

// 10. Bugs
router.get('/bugs', bugController.getBugs);
router.post('/bugs/analyze', authenticate, logAudit('ANALYZE_BUG', 'Bug'), bugController.analyzeBug);
router.get('/bugs/:id', bugController.getBugById);
router.delete('/bugs/:id', authenticate, logAudit('DELETE_BUG', 'Bug'), bugController.deleteBug);

// 11. Traceability & Coverage Matrix
router.get('/coverage/matrix', coverageController.getCoverageMatrix);

// 12. Jira Integration
router.get('/jira/config', jiraController.getConfig);
router.post('/jira/config', authenticate, logAudit('UPDATE_JIRA_CONFIG', 'JiraConfig'), jiraController.saveConfig);
router.get('/jira/issues/search', jiraController.searchIssues);
router.get('/jira/issues/:issueKey', jiraController.getIssueById);
router.post('/jira/issues/:issueKey/generate-tests', authenticate, logAudit('JIRA_GENERATE_TESTS', 'TestCase'), jiraController.generateTestsFromIssue);

// 13. AI History
router.get('/history', historyController.getHistory);
router.get('/history/:id', historyController.getHistoryById);
router.delete('/history', authenticate, logAudit('CLEAR_HISTORY', 'AIHistory'), historyController.clearHistory);

// 14. Prompt Versions
router.get('/prompts', promptController.getPromptVersions);
router.put('/prompts/:id', authenticate, logAudit('UPDATE_PROMPT', 'PromptVersion'), promptController.updatePromptVersion);
router.post('/prompts', authenticate, logAudit('CREATE_PROMPT', 'PromptVersion'), promptController.createPromptVersion);

// 15. Export & Automation Scripts
router.get('/export/testcases', exportController.exportTestCases);
router.post('/export/script', exportController.generateAutomationScript);

// 16. Settings
router.get('/settings', settingsController.getSettings);
router.post('/settings', authenticate, logAudit('UPDATE_SETTINGS', 'Settings'), settingsController.updateSettings);
router.get('/settings/audit-logs', settingsController.getAuditLogs);

module.exports = router;

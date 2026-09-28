const jiraService = require('../services/JiraService');
const aiService = require('../ai/AIService');
const db = require('../db/database');
const qualityEngine = require('../services/QualityEngine');

exports.getConfig = (req, res, next) => {
  try {
    const { projectId = 'proj-cmgalaxy-01' } = req.query;
    const config = jiraService.getConfig(projectId);
    res.json({ success: true, config });
  } catch (err) {
    next(err);
  }
};

exports.saveConfig = (req, res, next) => {
  try {
    const { projectId = 'proj-cmgalaxy-01', jira_url, username, api_token, project_key } = req.body;
    const saved = jiraService.saveConfig(projectId, {
      jira_url,
      username,
      api_token,
      project_key
    });
    res.json({ success: true, config: saved, message: 'Jira configuration saved securely.' });
  } catch (err) {
    next(err);
  }
};

exports.searchIssues = async (req, res, next) => {
  try {
    const { projectId = 'proj-cmgalaxy-01', query = '' } = req.query;
    const issues = await jiraService.searchIssues(projectId, query);
    res.json({ success: true, issues });
  } catch (err) {
    next(err);
  }
};

exports.getIssueById = async (req, res, next) => {
  try {
    const { issueKey } = req.params;
    const { projectId = 'proj-cmgalaxy-01' } = req.query;
    const issue = await jiraService.getIssue(projectId, issueKey);
    res.json({ success: true, issue });
  } catch (err) {
    next(err);
  }
};

exports.generateTestsFromIssue = async (req, res, next) => {
  try {
    const { issueKey } = req.params;
    const { projectId = 'proj-cmgalaxy-01', auto_save = true } = req.body;

    const issue = await jiraService.getIssue(projectId, issueKey);

    const requirementText = `Jira Ticket: [${issue.issue_key}] ${issue.summary}
Description:
${issue.description}

Acceptance Criteria:
${issue.acceptance_criteria}

Priority: ${issue.priority} | Components: ${(issue.components || []).join(', ')}`;

    const options = {
      projectId,
      requirementId: issue.issue_key,
      module: (issue.components && issue.components[0]) || 'Core',
      feature: issue.summary,
      focus: 'Jira Story Acceptance Criteria & Edge Cases'
    };

    // Generate test cases using AI engine
    const aiResult = await aiService.generateTestCases(requirementText, options, req.user);
    const testCases = aiResult.test_cases || [];

    // Audit quality
    const qualityReport = qualityEngine.evaluate(testCases);

    let savedCases = [];
    if (auto_save && testCases.length > 0) {
      const docsToInsert = testCases.map(tc => ({
        project_id: projectId,
        requirement_id: issue.issue_key,
        module: tc.module || options.module,
        feature: tc.feature || issue.summary,
        scenario: tc.scenario,
        title: tc.title,
        preconditions: tc.preconditions || `Jira Issue ${issue.issue_key} configured`,
        test_data: tc.test_data || 'Standard input dataset',
        steps: tc.steps,
        expected_result: tc.expected_result,
        priority: tc.priority || 'P2-High',
        test_type: tc.test_type || 'Functional',
        automation_candidate: tc.automation_candidate !== undefined ? tc.automation_candidate : true,
        notes: `Generated directly from Jira Issue ${issue.issue_key}`,
        status: 'Approved',
        quality_score: qualityReport.quality_score
      }));

      savedCases = db.insertMany('test_cases', docsToInsert);
    }

    res.json({
      success: true,
      issue_key: issue.issue_key,
      test_cases: savedCases.length > 0 ? savedCases : testCases,
      quality_report: qualityReport,
      count: testCases.length
    });
  } catch (err) {
    next(err);
  }
};

const db = require('../db/database');
const aiService = require('../ai/AIService');

exports.getBugs = (req, res, next) => {
  try {
    const { projectId } = req.query;
    const bugs = db.find('bugs', projectId ? { project_id: projectId } : null, { created_at: 'desc' });
    res.json({ success: true, bugs });
  } catch (err) {
    next(err);
  }
};

exports.getBugById = (req, res, next) => {
  try {
    const bug = db.findById('bugs', req.params.id);
    if (!bug) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Bug record not found.' });
    }
    res.json({ success: true, bug });
  } catch (err) {
    next(err);
  }
};

exports.analyzeBug = async (req, res, next) => {
  try {
    const {
      project_id = 'proj-cmgalaxy-01',
      title,
      description,
      steps_to_reproduce,
      expected_result,
      actual_result,
      affected_module = 'Core',
      environment = 'Production',
      browser = 'Chrome 128',
      device = 'Desktop',
      build_version = 'v2.4.1',
      auto_save = true
    } = req.body;

    if (!title || !steps_to_reproduce || !expected_result || !actual_result) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Bug Title, Steps to Reproduce, Expected Result, and Actual Result are required.'
      });
    }

    const bugPayload = {
      projectId: project_id,
      title,
      description: description || title,
      steps_to_reproduce,
      expected_result,
      actual_result,
      affected_module,
      environment,
      browser,
      device,
      build_version
    };

    // Run AI analysis
    const analysis = await aiService.analyzeBug(bugPayload, req.user);

    let savedBug = null;
    let createdRegressionTests = [];

    if (auto_save) {
      // 1. Save Bug Record
      savedBug = db.insert('bugs', {
        project_id,
        title,
        description: description || title,
        steps_to_reproduce,
        expected_result,
        actual_result,
        affected_module: analysis.affected_module || affected_module,
        environment,
        browser,
        device,
        build_version,
        analysis_result: analysis,
        regression_scenarios: analysis.regression_test_cases || []
      });

      // 2. Automatically save Bug -> Regression Test Cases into Regression Repository (Section 11)
      if (Array.isArray(analysis.regression_test_cases) && analysis.regression_test_cases.length > 0) {
        const regressionDocs = analysis.regression_test_cases.map((rc, idx) => {
          const count = db.count('regression_tests', { project_id });
          return {
            project_id,
            regression_id: `REG-BUG-${String(count + idx + 1).padStart(3, '0')}`,
            affected_module: rc.affected_module || analysis.affected_module || affected_module,
            related_requirement: `Defect-${savedBug.id.slice(0, 8)}`,
            scenario: rc.scenario,
            steps: rc.steps,
            expected_result: rc.expected_result,
            priority: rc.priority || 'P1-Critical',
            reason_for_regression: rc.reason_for_regression || `Prevent recurrence of bug: "${title}"`,
            classification: rc.classification || 'Critical Regression',
            impact_type: rc.impact_type || 'Direct impact'
          };
        });
        createdRegressionTests = db.insertMany('regression_tests', regressionDocs);
      }
    }

    res.json({
      success: true,
      analysis,
      bug: savedBug,
      created_regression_tests: createdRegressionTests
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBug = (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = db.remove('bugs', id);
    if (!removed) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Bug not found.' });
    }
    res.json({ success: true, message: 'Bug deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

const db = require('../db/database');
const aiService = require('../ai/AIService');

exports.getRegressionTests = (req, res, next) => {
  try {
    const { projectId, classification, impactType } = req.query;
    const filterFn = (r) => {
      if (projectId && r.project_id !== projectId) return false;
      if (classification && r.classification !== classification) return false;
      if (impactType && r.impact_type !== impactType) return false;
      return true;
    };
    const tests = db.find('regression_tests', filterFn, { created_at: 'desc' });
    res.json({ success: true, regression_tests: tests });
  } catch (err) {
    next(err);
  }
};

exports.generateRegressionTests = async (req, res, next) => {
  try {
    const {
      project_id = 'proj-cmgalaxy-01',
      requirement,
      requirement_id,
      existing_test_cases,
      changes,
      release_notes,
      auto_save = true
    } = req.body;

    if (!requirement && !changes && !requirement_id) {
      return res.status(400).json({ error: 'MISSING_INPUT', message: 'Requirement or change description is required.' });
    }

    let existingTests = existing_test_cases;
    if (!existingTests && project_id) {
      existingTests = db.find('test_cases', { project_id }).slice(0, 10);
    }

    const payload = {
      projectId: project_id,
      requirement: requirement || '',
      requirementId: requirement_id || 'REQ-CORE',
      existingTestCases: existingTests,
      changes: changes || release_notes || 'Core functionality upgrade'
    };

    const aiResult = await aiService.generateRegressionTests(payload, req.user);
    const generated = aiResult.regression_test_cases || [];

    let saved = [];
    if (auto_save && generated.length > 0) {
      const docs = generated.map((gt, i) => {
        const count = db.count('regression_tests', { project_id });
        return {
          project_id,
          regression_id: gt.regression_id || `REG-${String(count + i + 1).padStart(3, '0')}`,
          affected_module: gt.affected_module || 'Core',
          related_requirement: gt.related_requirement || payload.requirementId,
          scenario: gt.scenario,
          steps: gt.steps,
          expected_result: gt.expected_result,
          priority: gt.priority || 'P2-High',
          reason_for_regression: gt.reason_for_regression || 'Impact from recent code updates',
          classification: gt.classification || 'High Regression',
          impact_type: gt.impact_type || 'Direct impact'
        };
      });
      saved = db.insertMany('regression_tests', docs);
    }

    res.json({
      success: true,
      impact_summary: aiResult.impact_summary,
      regression_test_cases: saved.length > 0 ? saved : generated
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteRegressionTest = (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = db.remove('regression_tests', id);
    if (!removed) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Regression test not found.' });
    }
    res.json({ success: true, message: 'Regression test deleted.' });
  } catch (err) {
    next(err);
  }
};

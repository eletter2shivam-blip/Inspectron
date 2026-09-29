const db = require('../db/database');
const aiService = require('../ai/AIService');

exports.analyzeEdgeCases = async (req, res, next) => {
  try {
    const { requirement_text, requirement_id, project_id = 'proj-inspectron-01' } = req.body;

    if (!requirement_text && !requirement_id) {
      return res.status(400).json({ error: 'MISSING_INPUT', message: 'Requirement text or requirement ID is required.' });
    }

    let reqText = requirement_text;
    if (requirement_id) {
      const rec = db.findById('requirements', requirement_id);
      if (rec && !reqText) reqText = rec.raw_text;
    }

    const existingTests = db.find('test_cases', { project_id }).slice(0, 10);

    const result = await aiService.findEdgeCases({
      projectId: project_id,
      requirement: reqText,
      existingTestCases: existingTests
    }, req.user);

    res.json({
      success: true,
      edge_cases: result.edge_cases || []
    });
  } catch (err) {
    next(err);
  }
};

// Convert edge case directly into a permanent test case
exports.promoteToTestCase = (req, res, next) => {
  try {
    const { edge_case, project_id = 'proj-inspectron-01', requirement_id = 'REQ-EDGE' } = req.body;
    if (!edge_case) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Edge case object is required.' });
    }

    const count = db.count('test_cases', { project_id });
    const tcId = `TC-EDG-${String(count + 1).padStart(3, '0')}`;

    const newCase = db.insert('test_cases', {
      test_case_id: tcId,
      project_id,
      requirement_id,
      module: edge_case.category || 'Edge Cases',
      feature: 'Edge Case Hardening',
      scenario: edge_case.missing_scenario,
      title: `Verify edge condition: ${edge_case.missing_scenario}`,
      preconditions: 'System operational with network or boundary simulation configured.',
      test_data: `Edge payload for ${edge_case.category || 'Validation'}`,
      steps: [
        '1. Set up simulated boundary/network condition',
        `2. Execute action: ${edge_case.suggested_test_case}`,
        '3. Inspect response and system log'
      ],
      expected_result: `System prevents failure; ${edge_case.why_it_matters}`,
      priority: edge_case.risk_level === 'High' ? 'P1-Critical' : 'P2-High',
      test_type: 'Boundary',
      automation_candidate: true,
      notes: `Imported from Edge Case Analyzer. Risk: ${edge_case.risk_level}`,
      status: 'Approved',
      quality_score: 96
    });

    res.status(201).json({ success: true, test_case: newCase });
  } catch (err) {
    next(err);
  }
};

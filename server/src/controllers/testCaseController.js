const db = require('../db/database');
const aiService = require('../ai/AIService');
const qualityEngine = require('../services/QualityEngine');

exports.getTestCases = (req, res, next) => {
  try {
    const {
      projectId,
      requirementId,
      module,
      priority,
      testType,
      status,
      automationCandidate,
      search,
      sortBy = 'created_at',
      sortDir = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    const filterFn = (tc) => {
      if (projectId && tc.project_id !== projectId) return false;
      if (requirementId && tc.requirement_id !== requirementId) return false;
      if (module && tc.module !== module) return false;
      if (priority && tc.priority !== priority) return false;
      if (testType && tc.test_type !== testType) return false;
      if (status && tc.status !== status) return false;
      if (automationCandidate !== undefined && automationCandidate !== '') {
        const isCandidate = automationCandidate === 'true';
        if (tc.automation_candidate !== isCandidate) return false;
      }
      if (search && search.trim().length > 0) {
        const q = search.toLowerCase();
        const inTitle = (tc.title || '').toLowerCase().includes(q);
        const inScenario = (tc.scenario || '').toLowerCase().includes(q);
        const inId = (tc.test_case_id || tc.id || '').toLowerCase().includes(q);
        const inModule = (tc.module || '').toLowerCase().includes(q);
        if (!inTitle && !inScenario && !inId && !inModule) return false;
      }
      return true;
    };

    const sortObj = { [sortBy]: sortDir };
    const pagination = { page: parseInt(page, 10), limit: parseInt(limit, 10) };

    const result = db.find('test_cases', filterFn, sortObj, pagination);
    res.json({
      success: true,
      test_cases: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (err) {
    next(err);
  }
};

exports.getTestCaseById = (req, res, next) => {
  try {
    const tc = db.findById('test_cases', req.params.id);
    if (!tc) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Test case not found.' });
    }
    res.json({ success: true, test_case: tc });
  } catch (err) {
    next(err);
  }
};

exports.generateTestCases = async (req, res, next) => {
  try {
    const {
      requirement_text,
      requirement_id,
      project_id = 'proj-cmgalaxy-01',
      module = 'General',
      feature = 'Feature Workflow',
      focus = 'Comprehensive',
      auto_save = true
    } = req.body;

    if (!requirement_text && !requirement_id) {
      return res.status(400).json({ error: 'MISSING_REQUIREMENT', message: 'Requirement text or requirement ID is required.' });
    }

    let rawReq = requirement_text;
    let reqRecord = null;
    if (requirement_id) {
      reqRecord = db.findById('requirements', requirement_id);
      if (reqRecord && !rawReq) {
        rawReq = reqRecord.raw_text;
      }
    }

    const options = {
      projectId: project_id,
      requirementId: requirement_id || reqRecord?.id || 'REQ-AUTO',
      module,
      feature,
      focus
    };

    // AI generation
    const genResult = await aiService.generateTestCases(rawReq, options, req.user);
    const testCases = genResult.test_cases || [];

    // Run quality review (Section 13)
    const qualityReport = qualityEngine.evaluate(testCases);

    let savedCases = [];
    if (auto_save && testCases.length > 0) {
      const docsToInsert = testCases.map((tc, idx) => ({
        project_id,
        requirement_id: options.requirementId,
        module: tc.module || module,
        feature: tc.feature || feature,
        scenario: tc.scenario,
        title: tc.title,
        preconditions: tc.preconditions || 'Prerequisites specified in requirement',
        test_data: tc.test_data || 'Standard test dataset',
        steps: tc.steps,
        expected_result: tc.expected_result,
        priority: tc.priority || 'P2-High',
        test_type: tc.test_type || 'Functional',
        automation_candidate: tc.automation_candidate !== undefined ? tc.automation_candidate : true,
        notes: tc.notes || '',
        status: 'Draft',
        quality_score: qualityReport.quality_score
      }));

      savedCases = db.insertMany('test_cases', docsToInsert);

      // Update requirement coverage record (Section 12)
      updateCoverageRecord(project_id, options.requirementId);
    }

    res.json({
      success: true,
      test_cases: savedCases.length > 0 ? savedCases : testCases,
      quality_report: qualityReport,
      count: testCases.length
    });
  } catch (err) {
    next(err);
  }
};

exports.createTestCase = (req, res, next) => {
  try {
    const {
      project_id = 'proj-cmgalaxy-01',
      requirement_id = 'REQ-001',
      module = 'General',
      feature = 'Feature',
      scenario,
      title,
      preconditions,
      test_data,
      steps,
      expected_result,
      priority = 'P2-High',
      test_type = 'Functional',
      automation_candidate = true,
      notes = '',
      status = 'Draft'
    } = req.body;

    if (!title || !expected_result) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Test Case Title and Expected Result are mandatory.' });
    }

    const count = db.count('test_cases', { project_id });
    const tcId = `TC-${module.slice(0, 3).toUpperCase()}-${String(count + 1).padStart(3, '0')}`;

    const newCase = db.insert('test_cases', {
      test_case_id: tcId,
      project_id,
      requirement_id,
      module,
      feature,
      scenario: scenario || title,
      title,
      preconditions: preconditions || '',
      test_data: test_data || '',
      steps: Array.isArray(steps) ? steps : (steps || '').split('\n').filter(Boolean),
      expected_result,
      priority,
      test_type,
      automation_candidate,
      notes,
      status,
      quality_score: 95
    });

    updateCoverageRecord(project_id, requirement_id);

    res.status(201).json({ success: true, test_case: newCase });
  } catch (err) {
    next(err);
  }
};

exports.updateTestCase = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.findById('test_cases', id);
    if (!existing) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Test case not found.' });
    }

    const updated = db.update('test_cases', id, req.body);
    res.json({ success: true, test_case: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteTestCase = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.findById('test_cases', id);
    if (!existing) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Test case not found.' });
    }

    db.remove('test_cases', id);
    updateCoverageRecord(existing.project_id, existing.requirement_id);

    res.json({ success: true, message: 'Test case deleted.' });
  } catch (err) {
    next(err);
  }
};

// Section 14: Duplicate test case
exports.duplicateTestCase = (req, res, next) => {
  try {
    const { id } = req.params;
    const source = db.findById('test_cases', id);
    if (!source) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Test case not found.' });
    }

    const count = db.count('test_cases', { project_id: source.project_id });
    const newId = `TC-${(source.module || 'GEN').slice(0, 3).toUpperCase()}-${String(count + 1).padStart(3, '0')}`;

    const duplicated = db.insert('test_cases', {
      ...source,
      id: undefined,
      test_case_id: newId,
      title: `${source.title} (Copy)`,
      status: 'Draft'
    });

    res.status(201).json({ success: true, test_case: duplicated });
  } catch (err) {
    next(err);
  }
};

// Section 14: Bulk update status (Approve / Reject)
exports.bulkUpdateStatus = (req, res, next) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !status) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Array of ids and target status are required.' });
    }

    const updatedList = ids.map(id => db.update('test_cases', id, { status })).filter(Boolean);
    res.json({ success: true, updatedCount: updatedList.length });
  } catch (err) {
    next(err);
  }
};

// Section 13: Test Case Quality Audit
exports.auditQuality = (req, res, next) => {
  try {
    const { test_case_ids, projectId } = req.body;
    let cases = [];
    if (Array.isArray(test_case_ids) && test_case_ids.length > 0) {
      cases = test_case_ids.map(id => db.findById('test_cases', id)).filter(Boolean);
    } else {
      cases = db.find('test_cases', projectId ? { project_id: projectId } : null);
    }

    const report = qualityEngine.evaluate(cases);
    res.json({ success: true, quality_report: report });
  } catch (err) {
    next(err);
  }
};

// Helper: Recalculate Requirement Coverage
function updateCoverageRecord(projectId, requirementId) {
  if (!requirementId) return;
  try {
    const reqRecord = db.findById('requirements', requirementId);
    const relatedTests = db.find('test_cases', { requirement_id: requirementId });
    const count = relatedTests.length;

    let status = 'Missing';
    let pct = 0;
    let risk = 'High';
    let missingNotes = 'No test cases linked.';

    if (count >= 5) {
      status = 'Complete';
      pct = 100;
      risk = 'Low';
      missingNotes = 'Exhaustive test coverage across positive, negative, and edge cases.';
    } else if (count >= 1) {
      status = 'Partial';
      pct = Math.min(100, Math.round((count / 5) * 100));
      risk = 'Medium';
      missingNotes = `${count} test cases linked. Add additional boundary/negative tests for 100% sign-off.`;
    }

    const existingCov = db.findOne('coverage_records', { requirement_id: requirementId });
    if (existingCov) {
      db.update('coverage_records', existingCov.id, {
        test_case_ids: relatedTests.map(tc => tc.test_case_id || tc.id),
        coverage_status: status,
        coverage_percentage: pct,
        missing_coverage: missingNotes,
        risk
      });
    } else {
      db.insert('coverage_records', {
        project_id: projectId,
        requirement_id: requirementId,
        requirement_title: reqRecord ? reqRecord.title : requirementId,
        test_case_ids: relatedTests.map(tc => tc.test_case_id || tc.id),
        coverage_status: status,
        coverage_percentage: pct,
        missing_coverage: missingNotes,
        risk
      });
    }
  } catch (e) {
    console.warn('Coverage update warning:', e.message);
  }
}

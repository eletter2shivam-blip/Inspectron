const db = require('../db/database');
const aiService = require('../ai/AIService');
const automationExporter = require('../services/AutomationExporter');

exports.getApiTests = (req, res, next) => {
  try {
    const { projectId, method } = req.query;
    const filterFn = (t) => {
      if (projectId && t.project_id !== projectId) return false;
      if (method && t.method !== method.toUpperCase()) return false;
      return true;
    };
    const tests = db.find('api_tests', filterFn, { created_at: 'desc' });
    res.json({ success: true, api_tests: tests });
  } catch (err) {
    next(err);
  }
};

exports.generateApiTests = async (req, res, next) => {
  try {
    const {
      project_id = 'proj-cmgalaxy-01',
      method = 'GET',
      endpoint = '/api/v1/resource',
      headers = { 'Content-Type': 'application/json' },
      query_params = {},
      path_params = {},
      request_body = {},
      auth = 'Bearer Token',
      expected_status_code = 200,
      expected_response = {},
      auto_save = true
    } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'MISSING_ENDPOINT', message: 'API Endpoint path is required.' });
    }

    const spec = {
      projectId: project_id,
      method: method.toUpperCase(),
      endpoint,
      headers,
      query_params,
      path_params,
      request_body,
      auth,
      expected_status_code: parseInt(expected_status_code, 10),
      expected_response
    };

    const aiResult = await aiService.generateApiTests(spec, req.user);
    const tests = aiResult.api_tests || [];

    let saved = [];
    if (auto_save && tests.length > 0) {
      const docs = tests.map((t, idx) => {
        const count = db.count('api_tests', { project_id });
        return {
          project_id,
          api_test_id: t.api_test_id || `API-${spec.method}-${String(count + idx + 1).padStart(3, '0')}`,
          method: t.method || spec.method,
          endpoint: t.endpoint || spec.endpoint,
          headers: t.headers || spec.headers,
          query_params: t.query_params || {},
          path_params: t.path_params || {},
          request_body: t.request_body,
          test_data: t.test_data || 'Standard API test input',
          expected_status_code: t.expected_status_code || spec.expected_status_code,
          expected_response: t.expected_response || {},
          validation: t.validation || 'Assert status code and response schema',
          priority: t.priority || 'P2-High',
          postman_script: t.postman_script || ''
        };
      });
      saved = db.insertMany('api_tests', docs);
    }

    res.json({
      success: true,
      api_tests: saved.length > 0 ? saved : tests,
      count: tests.length
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteApiTest = (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = db.remove('api_tests', id);
    if (!removed) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'API test not found.' });
    }
    res.json({ success: true, message: 'API test deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.exportPostmanCollection = (req, res, next) => {
  try {
    const { projectId } = req.query;
    const tests = db.find('api_tests', projectId ? { project_id: projectId } : null);
    const collection = automationExporter.generatePostmanCollection(tests);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="AI_QA_Assistant_Postman_Collection.json"');
    res.send(JSON.stringify(collection, null, 2));
  } catch (err) {
    next(err);
  }
};

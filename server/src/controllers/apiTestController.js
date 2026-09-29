const db = require('../db/database');
const aiService = require('../ai/AIService');
const automationExporter = require('../services/AutomationExporter');
const apiExecutionEngine = require('../services/ApiExecutionEngine');

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
      project_id = 'proj-inspectron-01',
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

exports.executeTestCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const testCase = db.findById('api_tests', id) || db.findOne('api_tests', { api_test_id: id });
    if (!testCase) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'API test case not found.' });
    }

    const { envVars = {}, environmentId } = req.body;
    let environment = {};
    if (environmentId) {
      const envRec = db.findById('environments', environmentId);
      if (envRec && envRec.variables) {
        environment = { ...envRec.variables, baseUrl: envRec.base_url };
      }
    }

    const executionResult = await apiExecutionEngine.executeTestCase(testCase, { ...environment, ...envVars });
    res.json({
      success: true,
      execution: executionResult
    });
  } catch (err) {
    next(err);
  }
};

exports.executeAll = async (req, res, next) => {
  try {
    const { projectId = 'proj-inspectron-01', envVars = {}, environmentId } = req.body;
    const tests = db.find('api_tests', { project_id: projectId });
    if (!tests || tests.length === 0) {
      return res.json({ success: true, message: 'No API tests found to execute.', results: [] });
    }

    let environment = {};
    if (environmentId) {
      const envRec = db.findById('environments', environmentId);
      if (envRec && envRec.variables) {
        environment = { ...envRec.variables, baseUrl: envRec.base_url };
      }
    }

    const results = await apiExecutionEngine.executeCollection(tests, { ...environment, ...envVars });
    const passed = results.filter(r => r.status === 'PASSED').length;
    const failed = results.filter(r => r.status === 'FAILED').length;

    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed,
        pass_rate: results.length > 0 ? Math.round((passed / results.length) * 100) : 0
      },
      executions: results
    });
  } catch (err) {
    next(err);
  }
};

exports.getExecutions = (req, res, next) => {
  try {
    const { id } = req.params;
    const executions = db.find('api_executions', (e) => e.api_test_case_id === id, { executed_at: 'desc' });
    res.json({
      success: true,
      api_test_case_id: id,
      executions
    });
  } catch (err) {
    next(err);
  }
};

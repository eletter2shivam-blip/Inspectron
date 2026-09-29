const db = require('../db/database');
const { isSafeUrl } = require('../security/ssrf');
const { v4: uuidv4 } = require('uuid');

class ApiExecutionEngine {
  /**
   * Executes a single API test case.
   * @param {Object} apiTestCase - Record from api_test_cases
   * @param {Object} [envVars] - Environment key-value substitutions
   * @returns {Promise<Object>} Execution result record
   */
  static async executeTestCase(apiTestCase, envVars = {}) {
    const startTime = Date.now();
    let url = apiTestCase.endpoint || '';

    // Interpolate environment variables into URL (e.g. {{baseUrl}})
    for (const [key, val] of Object.entries(envVars)) {
      url = url.replace(new RegExp(`{{${key}}}`, 'g'), val);
    }

    // Default protocol if relative path or missing
    if (url.startsWith('/')) {
      const base = envVars.baseUrl || envVars.BASE_URL || 'http://localhost:5000';
      url = `${base}${url}`;
    }

    // SSRF Safety Check
    if (!isSafeUrl(url)) {
      const executionRecord = {
        id: `exec-${uuidv4().slice(0, 8)}`,
        api_test_case_id: apiTestCase.id,
        project_id: apiTestCase.project_id,
        status: 'FAILED',
        error: 'BLOCKED_SSRF: The target URL resolves to a protected or private IP space.',
        request_dump: { method: apiTestCase.method, url },
        response_status: 0,
        response_time_ms: 0,
        response_headers: {},
        response_body: null,
        assertion_results: [{ name: 'SSRF Check', passed: false, message: 'Private IP blocked' }],
        executed_at: new Date().toISOString()
      };
      db.insert('api_executions', executionRecord);
      return executionRecord;
    }

    // Prepare Request options
    const method = (apiTestCase.method || 'GET').toUpperCase();
    const headers = {
      'User-Agent': 'Inspectron-Api-Execution-Engine/1.0',
      'Content-Type': 'application/json',
      ...(apiTestCase.headers || {})
    };

    const fetchOptions = {
      method,
      headers
    };

    if (['POST', 'PUT', 'PATCH'].includes(method) && apiTestCase.request_body) {
      fetchOptions.body = typeof apiTestCase.request_body === 'string'
        ? apiTestCase.request_body
        : JSON.stringify(apiTestCase.request_body);
    }

    let responseStatus = 0;
    let responseHeaders = {};
    let responseBody = null;
    let durationMs = 0;
    let error = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      fetchOptions.signal = controller.signal;

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      durationMs = Date.now() - startTime;
      responseStatus = response.status;

      // Extract headers
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      const text = await response.text();
      try {
        responseBody = JSON.parse(text);
      } catch (e) {
        responseBody = text;
      }
    } catch (err) {
      durationMs = Date.now() - startTime;
      error = err.name === 'AbortError' ? 'Request timed out after 10000ms' : err.message;
    }

    // Evaluate Assertions
    const assertionResults = [];
    const expectedStatus = apiTestCase.expected_status_code || apiTestCase.expected_status || 200;

    // 1. Status Code Assertion
    const statusPassed = responseStatus === expectedStatus;
    assertionResults.push({
      name: `Status code is ${expectedStatus}`,
      passed: statusPassed,
      actual: responseStatus,
      expected: expectedStatus
    });

    // 2. Response Time Threshold (under 2000ms)
    const timePassed = durationMs < 2000;
    assertionResults.push({
      name: 'Response time under 2000ms',
      passed: timePassed,
      actual: `${durationMs}ms`,
      expected: '< 2000ms'
    });

    // 3. Custom assertions if defined on test case
    if (Array.isArray(apiTestCase.assertions)) {
      apiTestCase.assertions.forEach(a => {
        if (a.type === 'body_contains' && typeof responseBody === 'string') {
          const pass = responseBody.includes(a.value);
          assertionResults.push({ name: `Body contains "${a.value}"`, passed: pass });
        }
      });
    }

    const allPassed = !error && assertionResults.every(a => a.passed);

    const executionRecord = {
      id: `exec-${uuidv4().slice(0, 8)}`,
      api_test_case_id: apiTestCase.id,
      project_id: apiTestCase.project_id,
      status: allPassed ? 'PASSED' : 'FAILED',
      error,
      request_dump: { method, url, headers: fetchOptions.headers, body: fetchOptions.body },
      response_status: responseStatus,
      response_time_ms: durationMs,
      response_headers: responseHeaders,
      response_body: responseBody,
      assertion_results: assertionResults,
      executed_at: new Date().toISOString()
    };

    db.insert('api_executions', executionRecord);
    return executionRecord;
  }

  /**
   * Executes a collection of API test cases sequentially.
   */
  static async executeCollection(apiTestCases, envVars = {}) {
    const results = [];
    for (const testCase of apiTestCases) {
      const res = await this.executeTestCase(testCase, envVars);
      results.push(res);
    }
    return results;
  }
}

module.exports = ApiExecutionEngine;

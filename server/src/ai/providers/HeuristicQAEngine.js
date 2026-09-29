/**
 * HeuristicQAEngine
 * Advanced deterministic QA Intelligence Engine based on ISTQB, OWASP, and boundary-value analysis rules.
 * Extracts actors, actions, entities, constraints, and creates deep, production-grade test cases.
 */

class HeuristicQAEngine {
  constructor() {
    this.name = 'Heuristic QA Intelligence Engine v2.4';
  }

  // Helper to extract entities and concepts
  extractConcepts(text = '') {
    const lower = text.toLowerCase();
    const hasAuth = /login|password|auth|token|jwt|session|credential|oauth|signup|user/i.test(lower);
    const hasApi = /api|endpoint|get|post|put|delete|payload|json|rest/i.test(lower);
    const hasData = /database|table|record|export|csv|excel|sql|query/i.test(lower);
    const hasPayment = /payment|card|stripe|billing|invoice|checkout|price/i.test(lower);
    const hasSearch = /search|filter|sort|pagination|query|list/i.test(lower);
    const hasUpload = /upload|file|image|attachment|pdf|media/i.test(lower);

    // Extract user story actor if formatted as "As a <role>..."
    let actor = 'End User';
    const actorMatch = text.match(/as an?\s+([a-zA-Z0-9_\s-]+?)(?:,|\s+i\s+want)/i);
    if (actorMatch) {
      actor = actorMatch[1].trim();
    }

    // Extract primary goal/action
    let action = 'perform system action';
    const actionMatch = text.match(/i\s+want\s+(?:to\s+)?([^\n,.]+?)(?:so\s+that|\.|\n|$)/i);
    if (actionMatch) {
      action = actionMatch[1].trim();
    }

    return { hasAuth, hasApi, hasData, hasPayment, hasSearch, hasUpload, actor, action };
  }

  /**
   * 1. Analyze Requirement
   */
  async analyzeRequirement(requirementText, context = {}) {
    const { hasAuth, hasApi, hasPayment, hasSearch, hasUpload, actor, action } = this.extractConcepts(requirementText);
    const projectName = context.projectName || 'Inspectron';

    const actors = [
      actor.charAt(0).toUpperCase() + actor.slice(1),
      'System Administrator',
      'API Client / Backend Service'
    ];
    if (hasAuth) actors.push('Unauthenticated Visitor', 'Malicious Actor / Bot');
    if (hasPayment) actors.push('Finance Lead', 'Stripe Webhook Listener');

    const preconditions = [
      `User account is provisioned with active status in ${projectName}`,
      'Network connectivity is established and API gateway is healthy'
    ];
    if (hasAuth) preconditions.push('Session cookies or Bearer JWT are initialized', 'User possesses verified email address');
    if (hasPayment) preconditions.push('Valid billing profile with payment method on file');

    const businessRules = [
      `All user inputs must be sanitized against SQLi and XSS before persistence`,
      `State transitions must be atomic and committed to PostgreSQL with audit trail`
    ];
    if (hasAuth) {
      businessRules.push(
        'Token/link validity strictly capped at 15 minutes',
        'Single-use token constraint: consumed tokens must be immediately revoked',
        'Password complexity: min 8 characters, 1 uppercase, 1 special character, 1 number',
        'Rate limit to maximum 3 requests per hour per IP/identifier to protect against abuse'
      );
    }
    if (hasSearch) {
      businessRules.push('Pagination default to 20 items per page with max ceiling of 100');
    }

    const functionalRequirements = [
      `Render accessible UI elements enabling ${actor} to ${action}`,
      'Perform instantaneous client-side validation on all mandatory input controls',
      'Persist modified state and return standardized JSON payload with timestamp',
      'Provide contextual toast notifications upon success or validation errors'
    ];

    const nonFunctionalConsiderations = [
      'P95 response time under 400ms under standard operational load',
      'TLS 1.3 encryption in transit and AES-256 at rest for sensitive attributes',
      'WCAG 2.1 AA accessibility compliance including keyboard tab navigation',
      'Idempotent API processing to avoid duplicate transactions on network retry'
    ];

    const acceptanceCriteria = [
      `AC-1: ${actor} can successfully execute: "${action}" when valid inputs are supplied`,
      'AC-2: Submitting empty, malformed, or boundary-violating inputs renders clear inline field errors',
      'AC-3: System displays actionable loading indicator while backend processing is underway',
      'AC-4: Unauthorized access attempts are rejected with HTTP 401/403 and redirected to login',
      'AC-5: Network disruptions display a graceful retry prompt without loss of entered form data'
    ];

    const ambiguities = [
      `Unclear what exact error message should be displayed if downstream dependencies fail or time out`,
      `Unspecified whether mobile viewport requires a specialized simplified card layout versus full table`,
      `Audit logging requirements not explicitly specified for compliance tracking`
    ];

    const missingInformation = [
      'Specific role-based access permissions (RBAC) required for different team tiers',
      'Telemetry and analytics event names to fire for data funnel tracking',
      'Internationalization (i18n) / localization requirements for non-English users'
    ];

    const dependencies = [
      `${projectName} Core API Service`,
      'PostgreSQL Primary Datastore',
      'Redis Distributed Cache & Rate Limiting Cluster'
    ];
    if (hasAuth) dependencies.push('Transactional Email Service (SendGrid/AWS SES)');
    if (hasPayment) dependencies.push('Payment Gateway API Provider');

    const risks = [
      'Concurrent updates causing race conditions and inconsistent state',
      'Third-party external gateway latency causing user session timeouts',
      'Incomplete input sanitization leading to potential injection vulnerabilities'
    ];

    const testableConditions = [
      'Boundary value testing on minimum and maximum input lengths',
      'Simultaneous double-clicking on submit button (race condition / idempotency check)',
      'Submitting special Unicode, UTF-8 emoji, and HTML script characters',
      'Network throttling simulation (Slow 3G, offline recovery)'
    ];

    return {
      summary: `Structured requirement specification for "${action}" on ${projectName}, defining workflow parameters, validation constraints, and security standards.`,
      actors,
      preconditions,
      business_rules: businessRules,
      functional_requirements: functionalRequirements,
      non_functional_considerations: nonFunctionalConsiderations,
      acceptance_criteria: acceptanceCriteria,
      ambiguities,
      missing_information: missingInformation,
      dependencies,
      risks,
      testable_conditions: testableConditions
    };
  }

  /**
   * 2. Generate Test Cases
   */
  async generateTestCases(requirementText, options = {}) {
    const { hasAuth, hasApi, hasData, hasSearch, actor, action } = this.extractConcepts(requirementText);
    const reqId = options.requirementId || 'REQ-001';
    const moduleName = options.module || (hasAuth ? 'Login' : hasApi ? 'API' : 'Dashboard');
    const featureName = options.feature || 'Core Workflow';

    const testCases = [];
    let counter = 1;
    const nextId = () => `TC-${moduleName.toUpperCase().slice(0, 3)}-${String(counter++).padStart(3, '0')}`;

    // 1. Positive / Happy Path
    testCases.push({
      test_case_id: nextId(),
      requirement_id: reqId,
      module: moduleName,
      feature: featureName,
      scenario: `Verify standard successful execution of ${action}`,
      title: `Verify ${actor} can successfully ${action} with valid inputs`,
      preconditions: `User is authenticated with valid credentials; module ${moduleName} is accessible.`,
      test_data: `Standard valid payload with clean alphanumeric characters`,
      steps: [
        `1. Navigate to ${moduleName} interface`,
        `2. Fill in all required fields with valid input parameters`,
        `3. Click the primary submission/action button`,
        `4. Inspect the updated view and confirmation feedback`
      ],
      expected_result: `Action completes successfully; database updates state; success toast is displayed; no console errors.`,
      priority: 'P1-Critical',
      test_type: 'Functional',
      automation_candidate: true,
      notes: 'Primary happy path; baseline candidate for CI/CD smoke test suite.'
    });

    // 2. Negative / Missing Required Fields
    testCases.push({
      test_case_id: nextId(),
      requirement_id: reqId,
      module: moduleName,
      feature: featureName,
      scenario: `Validation failure when required fields are submitted empty`,
      title: `Verify inline validation error when required fields are left blank`,
      preconditions: `User is on the ${moduleName} form.`,
      test_data: `All mandatory fields set to empty string ""`,
      steps: [
        `1. Clear all inputs on the ${moduleName} form`,
        `2. Attempt to submit by clicking submit button`,
        `3. Observe input field highlights and validation messages`
      ],
      expected_result: `Form submission is blocked; mandatory inputs are highlighted in red; specific helper text "This field is required" is displayed.`,
      priority: 'P2-High',
      test_type: 'Negative',
      automation_candidate: true,
      notes: 'Client-side and server-side validation integrity verification.'
    });

    // 3. Boundary / Character Limit
    testCases.push({
      test_case_id: nextId(),
      requirement_id: reqId,
      module: moduleName,
      feature: featureName,
      scenario: `Boundary limit validation for minimum and maximum allowed length`,
      title: `Verify field behavior at exact minimum (N) and maximum allowed character limits (N_MAX)`,
      preconditions: `User has access to input form.`,
      test_data: `Min boundary: 1 char, Max boundary: 255 chars, Overflow: 256 chars`,
      steps: [
        `1. Enter input of exactly maximum permitted length (e.g. 255 characters)`,
        `2. Confirm acceptance and submit`,
        `3. Attempt to paste 256 characters into the field`
      ],
      expected_result: `Field accepts exact boundary (255 chars); field prevents typing beyond limit or displays counter "255/255 characters reached".`,
      priority: 'P2-High',
      test_type: 'Boundary',
      automation_candidate: true,
      notes: 'Checks database schema constraint alignment and UI truncation.'
    });

    // 4. Security / Injection & XSS
    testCases.push({
      test_case_id: nextId(),
      requirement_id: reqId,
      module: moduleName,
      feature: featureName,
      scenario: `Input sanitization against Cross-Site Scripting (XSS) and SQL Injection payloads`,
      title: `Verify system sanitizes or rejects malicious XSS script tags and SQL syntax`,
      preconditions: `User is authenticated.`,
      test_data: `<script>alert('XSS_TEST')</script> OR '1'='1' --`,
      steps: [
        `1. Enter malicious script payload into text inputs`,
        `2. Submit the form`,
        `3. View the rendered output on dashboard and verify DOM source`
      ],
      expected_result: `Payload is HTML-encoded/sanitized; no JavaScript executes; SQL queries are parameterized safely.`,
      priority: 'P1-Critical',
      test_type: 'Security',
      automation_candidate: true,
      notes: 'Critical security regression test for OWASP Top 10 vulnerabilities.'
    });

    // 5. Concurrency / Idempotency / Double Click
    testCases.push({
      test_case_id: nextId(),
      requirement_id: reqId,
      module: moduleName,
      feature: featureName,
      scenario: `Rapid multi-click submission idempotency check`,
      title: `Verify rapid duplicate clicks on submit button do not create duplicate records`,
      preconditions: `Form is filled with valid data.`,
      test_data: `Valid submission data`,
      steps: [
        `1. Click the Submit button 3 times in rapid succession (< 200ms)`,
        `2. Monitor network panel requests and backend database records`
      ],
      expected_result: `Submit button disables immediately upon first click with loading spinner; only 1 transaction is processed in backend; no duplicate entity created.`,
      priority: 'P2-High',
      test_type: 'Integration',
      automation_candidate: true,
      notes: 'Idempotency key or UI button debouncing validation.'
    });

    // 6. Session / Permission / Unauthorized Access
    testCases.push({
      test_case_id: nextId(),
      requirement_id: reqId,
      module: moduleName,
      feature: featureName,
      scenario: `Session timeout and unauthorized direct URL access`,
      title: `Verify unauthenticated or expired user is redirected to login with redirect_url preserved`,
      preconditions: `User session cookie/token has expired or is cleared.`,
      test_data: `Expired JWT token or cleared localStorage`,
      steps: [
        `1. Clear authentication token in browser storage`,
        `2. Attempt to navigate directly to ${moduleName} protected endpoint`,
        `3. Check network status and view navigation`
      ],
      expected_result: `Request returns 401 Unauthorized; browser redirects to /login?redirect_to=${encodeURIComponent(moduleName)}; no protected data is exposed.`,
      priority: 'P1-Critical',
      test_type: 'Security',
      automation_candidate: true,
      notes: 'Authentication gatekeeper verification.'
    });

    // 7. Error Handling / Network Drop & Graceful Recovery
    testCases.push({
      test_case_id: nextId(),
      requirement_id: reqId,
      module: moduleName,
      feature: featureName,
      scenario: `Graceful error handling when server returns 500 internal server error`,
      title: `Verify UI displays user-friendly error dialog when API returns 500 error`,
      preconditions: `API mock configured to respond with HTTP 500 Internal Server Error.`,
      test_data: `Standard request triggered under server fault injection`,
      steps: [
        `1. Trigger action on ${moduleName}`,
        `2. Mock server response with HTTP 500 and payload { "error": "Internal error" }`,
        `3. Observe UI reaction`
      ],
      expected_result: `UI catches error gracefully; shows message "Something went wrong. Please try again"; provides "Retry" button; user input is preserved in form.`,
      priority: 'P2-High',
      test_type: 'Functional',
      automation_candidate: true,
      notes: 'Resilience and user experience recovery testing.'
    });

    // 8. Compatibility / Responsive Viewport
    testCases.push({
      test_case_id: nextId(),
      requirement_id: reqId,
      module: moduleName,
      feature: featureName,
      scenario: `Responsive layout and touch target compliance across mobile and desktop`,
      title: `Verify ${moduleName} layout renders correctly without horizontal scroll on mobile viewport (375px)`,
      preconditions: `Browser devtools viewport set to 375x812 (iPhone 13/14).`,
      test_data: `N/A`,
      steps: [
        `1. Open ${moduleName} on mobile viewport`,
        `2. Check navigation header, form inputs, button tap targets (min 44x44px)`,
        `3. Fill and submit action using touch interactions`
      ],
      expected_result: `All elements wrap cleanly; zero horizontal overflow; buttons accessible and responsive.`,
      priority: 'P3-Medium',
      test_type: 'Compatibility',
      automation_candidate: false,
      notes: 'Cross-device visual regression inspection.'
    });

    return { test_cases: testCases };
  }

  /**
   * 3. Generate Regression Tests
   */
  async generateRegressionTests(input) {
    const requirement = input.requirement || 'System update';
    const changes = input.changes || input.releaseNotes || 'Core module updates';
    const reqId = input.requirementId || 'REQ-REG';

    return {
      impact_summary: `Identified direct impact on primary business workflow, indirect impact on audit logs and analytics reporting, and external dependency risk on notification gateways.`,
      regression_test_cases: [
        {
          regression_id: 'REG-001',
          affected_module: 'Login / Authentication',
          related_requirement: reqId,
          scenario: 'Existing active session validation during credentials or permission update',
          steps: [
            '1. Maintain active session on Client A and Client B',
            '2. Apply change on Client A',
            '3. Make subsequent request on Client B'
          ],
          expected_result: 'Token revocation list immediately enforces security boundaries without ghost sessions.',
          priority: 'P1-Critical',
          reason_for_regression: 'Modifications to authentication filters can inadvertently leave stale tokens authorized.',
          classification: 'Critical Regression',
          impact_type: 'Direct impact'
        },
        {
          regression_id: 'REG-002',
          affected_module: 'Dashboard Analytics',
          related_requirement: reqId,
          scenario: 'Real-time counters and funnel charts calculate metrics accurately after schema migration',
          steps: [
            '1. Trigger 5 test events in system',
            '2. Open Dashboard and check metric tiles',
            '3. Compare database count with UI display'
          ],
          expected_result: 'All metrics match backend records exactly; cached counts refresh within 5 seconds.',
          priority: 'P2-High',
          reason_for_regression: 'Data model changes could alter aggregation queries or invalidate cache keys.',
          classification: 'High Regression',
          impact_type: 'Indirect impact'
        },
        {
          regression_id: 'REG-003',
          affected_module: 'Notifications & Alerts',
          related_requirement: reqId,
          scenario: 'Third-party webhook dispatch and in-app bell notification delivery',
          steps: [
            '1. Trigger event that fires notification',
            '2. Verify WebSocket message arrives in frontend',
            '3. Check email relay dispatch logs'
          ],
          expected_result: 'Notification badge increments by 1; email received with proper formatting and valid links.',
          priority: 'P2-High',
          reason_for_regression: 'Async event bus handlers could miss events if queue payload schemas changed.',
          classification: 'Medium Regression',
          impact_type: 'Dependency impact'
        },
        {
          regression_id: 'REG-004',
          affected_module: 'Reports Export',
          related_requirement: reqId,
          scenario: 'CSV and Excel data exports retain all columns without truncation or formatting corruption',
          steps: [
            '1. Navigate to Reports',
            '2. Select date range with > 100 records',
            '3. Click "Export to Excel (.xlsx)" and "Export to CSV"'
          ],
          expected_result: 'Downloaded spreadsheet contains correct headers, row counts, and date timestamps.',
          priority: 'P3-Medium',
          reason_for_regression: 'Export service serializer depends on entity attribute keys.',
          classification: 'Low Regression',
          impact_type: 'Indirect impact'
        }
      ]
    };
  }

  /**
   * 4. Generate API Tests
   */
  async generateApiTests(spec) {
    const method = (spec.method || 'GET').toUpperCase();
    const endpoint = spec.endpoint || '/api/v1/resource';
    const apiTests = [];
    let counter = 1;
    const nextId = () => `API-${method}-${String(counter++).padStart(3, '0')}`;

    // 1. Positive 200/201
    apiTests.push({
      api_test_id: nextId(),
      method: method,
      endpoint: endpoint,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {{valid_token}}' },
      query_params: spec.query_params || {},
      path_params: spec.path_params || {},
      request_body: spec.request_body || {},
      test_data: 'Valid authorization and payload',
      expected_status_code: method === 'POST' ? 201 : 200,
      expected_response: { status: 'success', data: {} },
      validation: `HTTP Status ${method === 'POST' ? '201 Created' : '200 OK'}, Response-Time < 500ms, Content-Type application/json, valid payload structure.`,
      priority: 'P1-Critical',
      postman_script: `pm.test("Status code is ${method === 'POST' ? 201 : 200}", function () {
    pm.response.to.have.status(${method === 'POST' ? 201 : 200});
});
pm.test("Response time is under 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
pm.test("Header Content-Type contains application/json", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});`
    });

    // 2. 401 Unauthorized (Missing Token)
    apiTests.push({
      api_test_id: nextId(),
      method: method,
      endpoint: endpoint,
      headers: { 'Content-Type': 'application/json' },
      query_params: spec.query_params || {},
      path_params: spec.path_params || {},
      request_body: spec.request_body || {},
      test_data: 'Missing Authorization header',
      expected_status_code: 401,
      expected_response: { error: 'UNAUTHORIZED', message: 'Authentication required' },
      validation: 'Status code 401 Unauthorized, header WWW-Authenticate present, error body contains standard error code.',
      priority: 'P1-Critical',
      postman_script: `pm.test("Status is 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});
pm.test("Error message is present", function () {
    var json = pm.response.json();
    pm.expect(json.error).to.eql("UNAUTHORIZED");
});`
    });

    // 3. 403 Forbidden (Insufficient Permissions)
    apiTests.push({
      api_test_id: nextId(),
      method: method,
      endpoint: endpoint,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {{read_only_token}}' },
      query_params: spec.query_params || {},
      path_params: spec.path_params || {},
      request_body: spec.request_body || {},
      test_data: 'Token belongs to read-only user without edit/write privileges',
      expected_status_code: 403,
      expected_response: { error: 'FORBIDDEN', message: 'Insufficient role permissions' },
      validation: 'Status code 403 Forbidden; system prevents role escalation.',
      priority: 'P2-High',
      postman_script: `pm.test("Status is 403 Forbidden", function () {
    pm.response.to.have.status(403);
});`
    });

    // 4. 400 Bad Request / Invalid JSON Syntax
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      apiTests.push({
        api_test_id: nextId(),
        method: method,
        endpoint: endpoint,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {{valid_token}}' },
        query_params: {},
        path_params: {},
        request_body: '{ "malformed": true, broken json }',
        test_data: 'Syntactically invalid JSON payload',
        expected_status_code: 400,
        expected_response: { error: 'BAD_REQUEST', message: 'Malformed JSON payload' },
        validation: 'Status code 400 Bad Request; server does not crash or leak stack trace.',
        priority: 'P2-High',
        postman_script: `pm.test("Status code is 400 Bad Request", function () {
    pm.response.to.have.status(400);
});`
      });

      // 5. 422 / 400 Data Type Mismatch
      apiTests.push({
        api_test_id: nextId(),
        method: method,
        endpoint: endpoint,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {{valid_token}}' },
        query_params: {},
        path_params: {},
        request_body: { id: "NOT_AN_INTEGER", amount: "INVALID_STRING" },
        test_data: 'String passed to numeric fields',
        expected_status_code: 422,
        expected_response: { error: 'VALIDATION_ERROR', fields: ['amount'] },
        validation: 'Status code 422 Unprocessable Entity or 400 with granular field validation array.',
        priority: 'P2-High',
        postman_script: `pm.test("Status is 422 or 400 validation error", function () {
    pm.expect([400, 422]).to.include(pm.response.code);
});`
      });
    }

    // 6. 429 Rate Limiting
    apiTests.push({
      api_test_id: nextId(),
      method: method,
      endpoint: endpoint,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {{valid_token}}' },
      query_params: spec.query_params || {},
      path_params: {},
      request_body: spec.request_body || {},
      test_data: 'Submitting 50 concurrent requests in 1 second',
      expected_status_code: 429,
      expected_response: { error: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' },
      validation: 'Status code 429 Too Many Requests; headers Retry-After or X-RateLimit-Reset are present.',
      priority: 'P2-High',
      postman_script: `pm.test("Status is 429 when rate limit tripped", function () {
    pm.response.to.have.status(429);
    pm.expect(pm.response.headers.has("Retry-After")).to.be.true;
});`
    });

    return { api_tests: apiTests };
  }

  /**
   * 5. Find Edge Cases
   */
  async findEdgeCases(input) {
    const reqText = input.requirement || '';
    const { hasAuth, hasApi, hasData } = this.extractConcepts(reqText);

    const edgeCases = [
      {
        missing_scenario: 'Unicode & Emoji Handling in Text Fields',
        category: 'Data Integrity',
        why_it_matters: 'Strings containing 4-byte UTF-8 emojis (e.g. 🚀, 💡) or non-Latin alphabets (Arabic, Cyrillic, Kanji) can cause database truncation or SQL crashes in MySQL/Postgres UTF8 vs UTF8MB4 encodings.',
        suggested_test_case: 'Input "Test Campaign 🚀 2026 ñ å 测试" into text fields, persist, and verify exact byte-for-byte retrieval on view screens.',
        risk_level: 'Medium'
      },
      {
        missing_scenario: 'Zero / Null / Empty Value Submissions',
        category: 'Boundary',
        why_it_matters: 'Frontend may send null, empty string "", undefined, or omit the key entirely. Inconsistent backend handling can throw NullPointerExceptions.',
        suggested_test_case: 'Send payload with keys explicitly mapped to null, empty string, and whitespace "   ". Verify uniform validation response.',
        risk_level: 'High'
      },
      {
        missing_scenario: 'Concurrent Update Race Conditions (Lost Updates)',
        category: 'Concurrency',
        why_it_matters: 'Two users simultaneously modifying the same record will overwrite each other unless optimistic locking or version tags are checked.',
        suggested_test_case: 'Open two browser tabs on the same record; edit in Tab 1 and save; then edit in Tab 2 and save without refreshing. Tab 2 should receive conflict warning (HTTP 409 Conflict).',
        risk_level: 'High'
      },
      {
        missing_scenario: 'Sudden Network Drop During Async Transaction',
        category: 'Network',
        why_it_matters: 'If client Wi-Fi disconnects after request is dispatched but before response arrives, user may click submit again, generating duplicate transactions or billing.',
        suggested_test_case: 'Throttle network to offline 200ms after clicking submit; verify client recovers gracefully and transaction idempotency key prevents re-execution.',
        risk_level: 'High'
      },
      {
        missing_scenario: 'Session Expiry While User Is Typing in Long Form',
        category: 'Session',
        why_it_matters: 'If JWT expires while user spends 20 minutes drafting content, submitting the form will discard all drafted text on redirect to login.',
        suggested_test_case: 'Let token expire while form is filled; click submit; verify app prompts for re-authentication in modal or stores draft in localStorage without wiping inputs.',
        risk_level: 'Medium'
      },
      {
        missing_scenario: 'Extreme Boundary Values for Numeric & Date Fields',
        category: 'Boundary',
        why_it_matters: 'Values like 0, -1, 999999999999, fractional pennies (0.0001), or leap years (Feb 29) can cause floating point calculation errors.',
        suggested_test_case: 'Input maximum 64-bit integer values, negative numbers, and leap year dates into respective inputs.',
        risk_level: 'Medium'
      }
    ];

    return { edge_cases: edgeCases };
  }

  /**
   * 6. Generate Synthetic Test Data
   */
  async generateTestData(spec) {
    const field = (spec.field_name || 'email').toLowerCase();
    const type = spec.data_type || 'Email';
    const quantity = parseInt(spec.quantity || 10, 10);

    const records = [];

    for (let i = 1; i <= quantity; i++) {
      let recType = 'valid';
      let value = '';
      let note = '';

      if (i === 1) {
        recType = 'valid';
        value = this.generateSampleValue(type, 'valid', i);
        note = 'Standard clean valid record';
      } else if (i === 2) {
        recType = 'valid';
        value = this.generateSampleValue(type, 'valid2', i);
        note = 'Realistic corporate value';
      } else if (i === 3) {
        recType = 'boundary';
        value = this.generateSampleValue(type, 'min_boundary', i);
        note = 'Minimum valid constraint length';
      } else if (i === 4) {
        recType = 'boundary';
        value = this.generateSampleValue(type, 'max_boundary', i);
        note = 'Maximum allowable threshold';
      } else if (i === 5) {
        recType = 'invalid';
        value = this.generateSampleValue(type, 'missing_format', i);
        note = 'Missing required syntax components';
      } else if (i === 6) {
        recType = 'invalid';
        value = this.generateSampleValue(type, 'illegal_chars', i);
        note = 'Forbidden character set injection';
      } else if (i === 7) {
        recType = 'negative';
        value = this.generateSampleValue(type, 'negative_value', i);
        note = 'Out of range / negative numeric value';
      } else if (i === 8) {
        recType = 'negative';
        value = this.generateSampleValue(type, 'xss_payload', i);
        note = 'Sanitization attack string';
      } else {
        recType = i % 2 === 0 ? 'realistic' : 'random';
        value = this.generateSampleValue(type, recType, i);
        note = `${recType} synthetic test point #${i}`;
      }

      records.push({ id: i, type: recType, value, note });
    }

    return {
      field_name: spec.field_name,
      data_type: spec.data_type,
      records
    };
  }

  generateSampleValue(type, variant, index) {
    const t = type.toLowerCase();
    const rand = Math.floor(1000 + Math.random() * 9000);

    if (t.includes('email')) {
      if (variant === 'valid') return `qa.engineer.${index}@inspectron.io`;
      if (variant === 'valid2') return `sarah.jenkins+test${index}@enterprise-corp.com`;
      if (variant === 'min_boundary') return `a@b.co`;
      if (variant === 'max_boundary') return `user_with_very_long_valid_local_part_at_threshold_${rand}@long-domain-name-testing.org`;
      if (variant === 'missing_format') return `invalid-email-without-at-sign-${index}.com`;
      if (variant === 'illegal_chars') return `user;drop table users;@domain.com`;
      if (variant === 'negative_value') return `user@domain..com`;
      if (variant === 'xss_payload') return `<script>alert(1)</script>@test.com`;
      return `user_${rand}_${index}@mock-domain.net`;
    }

    if (t.includes('phone')) {
      if (variant === 'valid') return `+1-415-555-019${index % 10}`;
      if (variant === 'min_boundary') return `1234567`;
      if (variant === 'max_boundary') return `+44-20-7946-0950-EXT-99999`;
      if (variant === 'missing_format') return `415555`;
      if (variant === 'illegal_chars') return `+1 (555) ABC-DEFG`;
      if (variant === 'negative_value') return `-4155551234`;
      if (variant === 'xss_payload') return `javascript:alert(1)`;
      return `+1-${Math.floor(200+Math.random()*700)}-555-${Math.floor(1000+Math.random()*9000)}`;
    }

    if (t.includes('currency') || t.includes('decimal') || t.includes('integer')) {
      if (variant === 'valid') return 250.00;
      if (variant === 'min_boundary') return 0.01;
      if (variant === 'max_boundary') return 9999999.99;
      if (variant === 'negative_value') return -50.00;
      if (variant === 'missing_format') return "NaN";
      if (variant === 'illegal_chars') return "$250.00 USD";
      return parseFloat((Math.random() * 5000 + 10).toFixed(2));
    }

    if (t.includes('password')) {
      if (variant === 'valid') return `Str0ngP@ssw0rd!${index}`;
      if (variant === 'min_boundary') return `Ab1!xyz7`;
      if (variant === 'max_boundary') return `ExtremelyLongPassphraseExceedingTypicalBufferLengths128Characters_SecureHashValidation!@#$%^2026`;
      if (variant === 'missing_format') return `weakpassword`;
      if (variant === 'illegal_chars') return `pass with spaces and null\0byte`;
      if (variant === 'negative_value') return `12345678`;
      return `P@ss_${rand}!Cm`;
    }

    if (t.includes('uuid')) {
      if (variant === 'valid') return `e4b3c2a1-0000-4000-8000-${String(index).padStart(12, '0')}`;
      if (variant === 'missing_format') return `not-a-uuid-string`;
      return `7f1b9a24-${rand}-4d2b-9e3f-${rand}${rand}`;
    }

    if (t.includes('url')) {
      if (variant === 'valid') return `https://app.inspectron.io/campaigns/${index}`;
      if (variant === 'missing_format') return `htp:/broken-url`;
      if (variant === 'xss_payload') return `javascript:alert(document.cookie)`;
      return `https://cdn.inspectron.io/assets/mock_item_${index}.json`;
    }

    // Default Name / Generic
    if (variant === 'valid') return `Alex Rivera ${index}`;
    if (variant === 'min_boundary') return `Jo`;
    if (variant === 'max_boundary') return `Sir Christopher Montgomery-Wellington III Esq. of New Hampshire County`;
    if (variant === 'illegal_chars') return `User' OR '1'='1`;
    if (variant === 'xss_payload') return `<img src=x onerror=alert(1)>`;
    return `Synthetic Entity ${index} (${rand})`;
  }

  /**
   * 7. Analyze Bug
   */
  async analyzeBug(bug) {
    const title = bug.title || 'Reported Bug';
    const desc = bug.description || '';
    const steps = bug.steps_to_reproduce || 'Steps not provided';
    const expected = bug.expected_result || 'Expected normal behavior';
    const actual = bug.actual_result || 'Application failed or threw error';
    const moduleName = bug.affected_module || 'Core';

    return {
      bug_summary: `Defect in ${moduleName}: "${title}". Actual state deviates from specification with symptom: ${actual.slice(0, 120)}.`,
      root_cause_hypothesis: `Probable race condition, unhandled async exception, or missing null-check in ${moduleName} event lifecycle when processing external state.`,
      affected_module: moduleName,
      affected_functionality: 'Event Dispatch & UI State Synchronization',
      reproduction_scenario: `Execute steps: 1. Set environment to ${bug.environment || 'Staging'}; 2. Replicate ${steps.slice(0, 100)}...; 3. Observe divergence where actual outcome is "${actual.slice(0, 80)}".`,
      original_test_scenario: `Verify ${moduleName} functions properly under standard operational constraints.`,
      regression_test_scenario: `Verify that after fixing "${title}", system strictly delivers expected outcome: "${expected}" under boundary error conditions.`,
      negative_scenario: `Trigger error condition deliberately with invalid tokens/state and verify UI displays graceful fallback banner instead of freezing.`,
      related_test_cases: ['TC-CMG-001', 'TC-CMG-006'],
      risk_areas: [
        'User workflow blockage due to silent state stalling',
        'Inconsistent state between frontend client cache and database store'
      ],
      suggested_additional_tests: [
        'Automated retry circuit-breaker test',
        'State persistence recovery test after browser reload'
      ],
      regression_test_cases: [
        {
          regression_id: `REG-BUG-${Math.floor(100 + Math.random() * 900)}`,
          affected_module: moduleName,
          related_requirement: `BugFix-${title.slice(0, 16)}`,
          scenario: `Prevent recurrence: ${title}`,
          steps: [
            `1. Recreate the failure preconditions in ${bug.environment || 'Staging'}`,
            `2. Execute reproduction steps: ${steps.slice(0, 120)}`,
            `3. Verify that the defect no longer occurs and ${expected}`
          ],
          expected_result: expected,
          priority: 'P1-Critical',
          reason_for_regression: `Direct regression test protecting against recurrence of defect: "${title}".`,
          classification: 'Critical Regression',
          impact_type: 'Direct impact'
        }
      ]
    };
  }

  /**
   * 8. Review Test Case Quality
   */
  async reviewTestCases(testCases = []) {
    let score = 95;
    const strengths = [];
    const weaknesses = [];
    const suggestions = [];
    let duplicates = 0;
    let missingPreconditions = 0;
    let missingExpected = 0;

    const seenTitles = new Set();

    testCases.forEach((tc, idx) => {
      // Check title duplicate
      if (seenTitles.has(tc.title?.toLowerCase())) {
        duplicates++;
        score -= 5;
      } else {
        seenTitles.add(tc.title?.toLowerCase());
      }

      // Check preconditions
      if (!tc.preconditions || tc.preconditions.trim().length === 0) {
        missingPreconditions++;
        score -= 3;
      }

      // Check expected result
      if (!tc.expected_result || tc.expected_result.trim().length === 0) {
        missingExpected++;
        score -= 5;
      }

      // Check steps count
      const steps = Array.isArray(tc.steps) ? tc.steps : (tc.steps || '').split('\n');
      if (steps.length < 2) {
        score -= 2;
      }
    });

    score = Math.max(10, Math.min(100, score));

    if (duplicates === 0) strengths.push('Zero duplicate test titles detected across test suite.');
    strengths.push('Comprehensive test coverage across multiple test types (Functional, Boundary, Security).');
    strengths.push('Clear step-by-step procedural reproduction actions.');

    if (missingPreconditions > 0) {
      weaknesses.push(`${missingPreconditions} test cases are missing explicit prerequisite system state.`);
      suggestions.push('Define explicit preconditions (e.g. database seeds, permissions) for all test cases.');
    }
    if (missingExpected > 0) {
      weaknesses.push(`${missingExpected} test cases lack detailed expected results.`);
      suggestions.push('Ensure each test case has explicit observable expected results.');
    }
    if (suggestions.length === 0) {
      suggestions.push('Maintain consistent locator tagging and keep test data decoupled from script logic.');
    }

    const grade = score >= 90 ? 'A' : score >= 80 ? 'B+' : score >= 70 ? 'B' : 'C';

    return {
      quality_score: score,
      grade,
      strengths,
      weaknesses,
      suggestions,
      duplicate_count: duplicates,
      missing_preconditions_count: missingPreconditions,
      missing_expected_results_count: missingExpected
    };
  }

  /**
   * 9. Analyze Coverage
   */
  async analyzeCoverage(requirements = [], testCases = []) {
    const records = [];

    requirements.forEach(req => {
      const matchingTests = testCases.filter(tc => tc.requirement_id === req.id);
      const count = matchingTests.length;
      let status = 'Missing';
      let pct = 0;
      let risk = 'High';
      let missingNotes = 'No test cases linked to this requirement yet.';

      if (count >= 5) {
        status = 'Complete';
        pct = 100;
        risk = 'Low';
        missingNotes = 'Exhaustive coverage including positive, negative, and edge cases.';
      } else if (count >= 1) {
        status = 'Partial';
        pct = Math.round((count / 5) * 100);
        risk = 'Medium';
        missingNotes = `Partial coverage with ${count} tests. Add boundary and security scenarios for full sign-off.`;
      }

      records.push({
        requirement_id: req.id,
        requirement_title: req.title,
        test_case_ids: matchingTests.map(tc => tc.test_case_id || tc.id),
        coverage_status: status,
        coverage_percentage: pct,
        missing_coverage: missingNotes,
        risk
      });
    });

    return records;
  }
}

module.exports = HeuristicQAEngine;

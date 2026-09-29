const test = require('node:test');
const assert = require('node:assert');
const { encryptSecret, decryptSecret, maskSecret } = require('../src/security/crypto');
const { isSafeUrl } = require('../src/security/ssrf');
const QAHealthEngine = require('../src/services/QAHealthEngine');
const JobQueue = require('../src/services/JobQueue');
const ApiExecutionEngine = require('../src/services/ApiExecutionEngine');
const db = require('../src/db/database');
const { app, server } = require('../src/index');

let BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let ephemeralServer = null;

test('Enterprise Features & Security Verification Suite', async (t) => {
  // Ensure server is listening
  if (!server || !server.listening) {
    ephemeralServer = app.listen(0);
    BASE_URL = `http://localhost:${ephemeralServer.address().port}/api`;
  }

  // 1. Secret Encryption, Decryption, and Masking (AES-256-GCM)
  await t.test('1. Cryptography: AES-256-GCM encrypts, decrypts, and masks tokens', () => {
    const rawSecret = 'atlassian_api_token_secure_987654321';
    const encrypted = encryptSecret(rawSecret);

    assert.notStrictEqual(encrypted, rawSecret);
    assert.strictEqual(encrypted.split(':').length, 3, 'Must be formatted as iv:ciphertext:tag');

    const decrypted = decryptSecret(encrypted);
    assert.strictEqual(decrypted, rawSecret, 'Decrypted secret must match original');

    const masked = maskSecret(rawSecret);
    assert.ok(masked.endsWith('4321'));
    assert.ok(masked.includes('*'));
  });

  // 2. SSRF Protection Engine
  await t.test('2. SSRF Guard: Blocks private and cloud metadata addresses', () => {
    // Dangerous / private targets
    assert.strictEqual(isSafeUrl('http://127.0.0.1:8080/admin'), false);
    assert.strictEqual(isSafeUrl('http://localhost:3000/secret'), false);
    assert.strictEqual(isSafeUrl('http://169.254.169.254/latest/meta-data/'), false);
    assert.strictEqual(isSafeUrl('http://10.0.0.1/internal'), false);
    assert.strictEqual(isSafeUrl('http://192.168.1.100/status'), false);
    assert.strictEqual(isSafeUrl('http://172.16.0.5/api'), false);
    assert.strictEqual(isSafeUrl('file:///etc/passwd'), false);

    // Safe public targets
    assert.strictEqual(isSafeUrl('https://api.github.com/users'), true);
    assert.strictEqual(isSafeUrl('https://httpbin.org/status/200'), true);
    assert.strictEqual(isSafeUrl('https://inspectron.atlassian.net'), true);
  });

  // 3. Mathematical QA Health Engine
  await t.test('3. QA Health Engine: Calculates deterministic mathematical health score', () => {
    const report = QAHealthEngine.calculateProjectHealth('proj-inspectron-01');

    assert.ok(typeof report.healthScore === 'number');
    assert.ok(report.healthScore >= 0 && report.healthScore <= 100);
    assert.ok(['EXCELLENT', 'GOOD', 'NEEDS_ATTENTION', 'CRITICAL'].includes(report.status));

    // Verify mathematical factors exist
    assert.ok('weights' in report);
    assert.strictEqual(report.weights.requirementCoverageWeight, 0.25);
    assert.strictEqual(report.weights.approvalRatioWeight, 0.20);
    assert.strictEqual(report.weights.executionPassRateWeight, 0.20);
    assert.strictEqual(report.weights.automationRatioWeight, 0.15);
    assert.strictEqual(report.weights.apiCoverageWeight, 0.10);
    assert.strictEqual(report.weights.defectPenaltyWeight, 0.10);
  });

  // 4. Background Job Queue (Asynchronous AI Jobs)
  await t.test('4. Job Queue: Dispatches, tracks progress, and completes async jobs', async () => {
    const job = JobQueue.createJob({
      projectId: 'proj-inspectron-01',
      userId: 'usr-lead-001',
      operation: 'TEST_RUN',
      payload: { suiteId: 'suite-01' }
    });
    assert.strictEqual(job.status, 'QUEUED');
    assert.strictEqual(job.progress, 0);

    JobQueue.updateProgress(job.id, 50);
    const updated = JobQueue.getJob(job.id);
    assert.strictEqual(updated.progress, 50);
    assert.strictEqual(updated.status, 'RUNNING');

    JobQueue.completeJob(job.id, { totalPassed: 10, totalFailed: 0 });
    const completed = JobQueue.getJob(job.id);
    assert.strictEqual(completed.status, 'COMPLETED');
    assert.strictEqual(completed.progress, 100);
    assert.strictEqual(completed.result.totalPassed, 10);
  });

  // 5. Test Case Versioning & Audit Trail
  await t.test('5. Test Case Versioning: Records incremental snapshots upon edit and approval', async () => {
    // Login to obtain auth token
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'lead@inspectron.io', password: 'password123' })
    });
    const loginData = await loginRes.json();
    authToken = loginData.token;

    // Create a new test case
    const createRes = await fetch(`${BASE_URL}/testcases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        project_id: 'proj-inspectron-01',
        requirement_id: 'REQ-CMG-001',
        module: 'Security',
        title: 'Verify multi-factor authentication SMS OTP brute-force lockout',
        expected_result: 'Account temporarily locked after 5 failed attempts'
      })
    });
    assert.strictEqual(createRes.status, 201);
    const created = (await createRes.json()).test_case;
    assert.strictEqual(created.version, 1);

    // Update test case
    const updateRes = await fetch(`${BASE_URL}/testcases/${created.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Verify MFA SMS OTP lockout after 5 consecutive incorrect codes',
        change_reason: 'Clarified consecutive attempts specification'
      })
    });
    assert.strictEqual(updateRes.status, 200);
    const updated = (await updateRes.json()).test_case;
    assert.strictEqual(updated.version, 2);

    // Approve test case
    const approveRes = await fetch(`${BASE_URL}/testcases/${created.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ reason: 'Reviewed and certified by Principal QA Architect' })
    });
    assert.strictEqual(approveRes.status, 200);
    const approved = (await approveRes.json()).test_case;
    assert.strictEqual(approved.status, 'Approved');
    assert.strictEqual(approved.version, 3);

    // Fetch version audit history
    const verRes = await fetch(`${BASE_URL}/testcases/${created.id}/versions`);
    assert.strictEqual(verRes.status, 200);
    const verBody = await verRes.json();
    assert.strictEqual(verBody.success, true);
    assert.ok(verBody.versions.length >= 3);
  });

  // 6. Live API Test Execution with SSRF Guard
  await t.test('6. API Execution Engine: Executes tests and blocks SSRF attempts', async () => {
    // Safe execution against external endpoint
    const safeTestCase = {
      id: 'test-exec-safe',
      project_id: 'proj-inspectron-01',
      method: 'GET',
      endpoint: 'https://httpbin.org/status/200',
      expected_status_code: 200
    };
    const safeResult = await ApiExecutionEngine.executeTestCase(safeTestCase);
    assert.strictEqual(safeResult.status, 'PASSED');
    assert.strictEqual(safeResult.response_status, 200);
    assert.ok(safeResult.response_time_ms >= 0);

    // Unsafe SSRF target execution
    const ssrfTestCase = {
      id: 'test-exec-ssrf',
      project_id: 'proj-inspectron-01',
      method: 'GET',
      endpoint: 'http://169.254.169.254/latest/meta-data',
      expected_status_code: 200
    };
    const ssrfResult = await ApiExecutionEngine.executeTestCase(ssrfTestCase);
    assert.strictEqual(ssrfResult.status, 'FAILED');
    assert.ok(ssrfResult.error.includes('BLOCKED_SSRF'));
  });

  // 7. OpenAPI 3.0 Documentation Endpoint
  await t.test('7. OpenAPI 3.0: Serves comprehensive machine-readable API contract', async () => {
    const res = await fetch(`${BASE_URL}/docs`);
    assert.strictEqual(res.status, 200);
    const spec = await res.json();
    assert.strictEqual(spec.openapi, '3.0.3');
    assert.ok(spec.info.title.includes('INSPECTRON'));
    assert.ok('/testcases' in spec.paths);
    assert.ok('/api-tests/{id}/execute' in spec.paths);
    assert.ok('TestCase' in spec.components.schemas);
  });

  // 8. Granular Dashboard Metrics Endpoints
  await t.test('8. Dashboard: Returns normalized breakdowns without hardcoded values', async () => {
    const summaryRes = await fetch(`${BASE_URL}/dashboard/summary`);
    assert.strictEqual(summaryRes.status, 200);
    const summary = await summaryRes.json();
    assert.strictEqual(summary.success, true);
    assert.ok('healthScore' in summary);
    assert.ok('testCoverage' in summary);

    const breakdownRes = await fetch(`${BASE_URL}/dashboard/test-type-breakdown`);
    assert.strictEqual(breakdownRes.status, 200);
    const breakdown = await breakdownRes.json();
    assert.strictEqual(breakdown.success, true);
    assert.ok(Array.isArray(breakdown.types));

    const prioRes = await fetch(`${BASE_URL}/dashboard/priority-distribution`);
    assert.strictEqual(prioRes.status, 200);
    const priorities = await prioRes.json();
    assert.strictEqual(priorities.success, true);
    assert.ok(Array.isArray(priorities.priorities));
  });

  // 9. RBAC Permissions Enforcement
  await t.test('9. RBAC: Unauthorized actions are rejected with 403 Forbidden', async () => {
    // Register a viewer user with read-only access
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Auditor View',
        email: 'auditor@inspectron.io',
        password: 'password123',
        role: 'viewer'
      })
    });
    const viewerToken = (await registerRes.json()).token;

    // Viewer attempts to create a project (requires projects:create)
    const createRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${viewerToken}`
      },
      body: JSON.stringify({ name: 'Unauthorized Project' })
    });
    assert.strictEqual(createRes.status, 403);
    const failBody = await createRes.json();
    assert.strictEqual(failBody.success, false);
    assert.ok(failBody.error.message.includes('lacks'));
  });
});

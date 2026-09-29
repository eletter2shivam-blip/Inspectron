const test = require('node:test');
const assert = require('node:assert');
const { app, server } = require('../src/index');

let authToken = '';
const BASE_URL = 'http://localhost:5000/api';

test('Inspectron QA Assistant Backend Suite', async (t) => {
  // Wait 500ms for server to bind
  await new Promise(r => setTimeout(r, 500));

  await t.test('1. Health check returns 200 and healthy status', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'HEALTHY');
    assert.ok(body.database.test_cases > 0);
  });

  await t.test('2. Authentication login succeeds for demo QA Lead', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'lead@inspectron.io', password: 'password123' })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.token);
    assert.strictEqual(body.user.email, 'lead@inspectron.io');
    authToken = body.token;
  });

  await t.test('3. Dashboard stats returns project metrics and charts', async () => {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.stats.totalProjects >= 1);
    assert.ok(body.stats.totalTestCases >= 5);
    assert.ok(body.charts.testTypes.length > 0);
    assert.ok(body.recentTestCases.length > 0);
  });

  await t.test('4. Requirement Analyzer processes user story into structured JSON', async () => {
    const story = 'As a campaign analyst, I want to filter ad reports by date range and campaign tag so that I can evaluate ROAS.';
    const res = await fetch(`${BASE_URL}/requirements/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        requirement_text: story,
        project_id: 'proj-inspectron-01',
        title: 'Campaign Analytics Date & Tag Filtering'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.analysis.actors.length > 0);
    assert.ok(body.analysis.functional_requirements.length > 0);
    assert.ok(body.analysis.acceptance_criteria.length > 0);
    assert.ok(body.analysis.ambiguities.length > 0);
  });

  await t.test('5. Test Case Generator synthesizes positive, negative, and boundary scenarios', async () => {
    const res = await fetch(`${BASE_URL}/testcases/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        project_id: 'proj-inspectron-01',
        requirement_text: 'As a user, I want to upload a CSV file with max 10MB to import campaign leads.',
        module: 'Campaign',
        feature: 'Lead CSV Import',
        auto_save: true
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.test_cases.length >= 5);
    assert.ok(body.quality_report.quality_score >= 80);

    // Verify first test case has all required fields
    const tc = body.test_cases[0];
    assert.ok(tc.title);
    assert.ok(tc.scenario);
    assert.ok(tc.expected_result);
    assert.ok(tc.priority);
    assert.ok(tc.test_type);
  });

  await t.test('6. Quality Engine correctly scores and inspects test cases', async () => {
    const res = await fetch(`${BASE_URL}/testcases/audit-quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: 'proj-inspectron-01' })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.quality_report.quality_score > 0);
    assert.ok(body.quality_report.grade);
  });

  await t.test('7. API Test Generator creates endpoints scenarios and Postman collection', async () => {
    const res = await fetch(`${BASE_URL}/api-tests/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        project_id: 'proj-inspectron-01',
        method: 'POST',
        endpoint: '/api/v1/campaigns',
        request_body: { name: 'Growth Campaign', daily_budget: 100 },
        expected_status_code: 201,
        auto_save: true
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.api_tests.length >= 4);

    // Test Postman collection export
    const exportRes = await fetch(`${BASE_URL}/api-tests/export/postman?projectId=proj-inspectron-01`);
    assert.strictEqual(exportRes.status, 200);
    const col = await exportRes.json();
    assert.ok(col.info);
    assert.ok(col.item.length > 0);
  });

  await t.test('8. Edge Case Analyzer identifies missing test conditions', async () => {
    const res = await fetch(`${BASE_URL}/edge-cases/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        project_id: 'proj-inspectron-01',
        requirement_text: 'Users can submit promo discount codes at checkout.'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.edge_cases.length >= 4);
  });

  await t.test('9. Test Data Generator produces synthetic records and exports CSV', async () => {
    const res = await fetch(`${BASE_URL}/test-data/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        project_id: 'proj-inspectron-01',
        field_name: 'phone_number',
        data_type: 'Phone',
        quantity: 10
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.records.length, 10);

    // Test data export
    const csvRes = await fetch(`${BASE_URL}/test-data/export?format=csv&datasetId=${body.dataset_id}`);
    assert.strictEqual(csvRes.status, 200);
    const csvText = await csvRes.text();
    assert.ok(csvText.includes('Record #'));
  });

  await t.test('10. Bug Analyzer converts defect into Root Cause and Regression Tests', async () => {
    const res = await fetch(`${BASE_URL}/bugs/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        project_id: 'proj-inspectron-01',
        title: 'Google Ads budget decimal rounding error overcharges client',
        steps_to_reproduce: '1. Set campaign budget to $14.99\n2. Sync to Google Ads API\n3. Check invoice',
        expected_result: 'Google Ads budget set to exactly 1499 micros without rounding up.',
        actual_result: 'Budget rounded to $15.00, causing billing variance in daily audit.',
        affected_module: 'Google Ads'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.analysis.root_cause_hypothesis);
    assert.ok(body.created_regression_tests.length > 0);
  });

  await t.test('11. Requirement -> Test Traceability Matrix computes coverage', async () => {
    const res = await fetch(`${BASE_URL}/coverage/matrix?projectId=proj-inspectron-01`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.matrix.length >= 2);
    assert.ok(body.summary.overallCoveragePercentage > 0);
  });

  await t.test('12. Jira Integration fetches tickets and generates test cases directly', async () => {
    // 1. Search issues
    const res = await fetch(`${BASE_URL}/jira/issues/search?projectId=proj-inspectron-01`);
    assert.strictEqual(res.status, 200);
    const issues = (await res.json()).issues;
    assert.ok(issues.length > 0);

    // 2. Generate tests directly from Jira ticket CMG-104
    const genRes = await fetch(`${BASE_URL}/jira/issues/CMG-104/generate-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ projectId: 'proj-inspectron-01', auto_save: true })
    });
    assert.strictEqual(genRes.status, 200);
    const genBody = await genRes.json();
    assert.strictEqual(genBody.success, true);
    assert.ok(genBody.test_cases.length > 0);
  });

  await t.test('13. Export test cases to Excel (.xlsx) and CSV', async () => {
    const xlsxRes = await fetch(`${BASE_URL}/export/testcases?format=xlsx&projectId=proj-inspectron-01`);
    assert.strictEqual(xlsxRes.status, 200);
    assert.strictEqual(xlsxRes.headers.get('content-type'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    const csvRes = await fetch(`${BASE_URL}/export/testcases?format=csv&projectId=proj-inspectron-01`);
    assert.strictEqual(csvRes.status, 200);
    const csvText = await csvRes.text();
    assert.ok(csvText.includes('Test Case ID'));
    assert.ok(csvText.includes('Expected Result'));
  });

  await t.test('14. Automation script generation produces Playwright and Selenium code', async () => {
    const tcRes = await fetch(`${BASE_URL}/testcases?projectId=proj-inspectron-01&limit=1`);
    const tc = (await tcRes.json()).test_cases[0];

    const pwRes = await fetch(`${BASE_URL}/export/script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testCaseId: tc.id, framework: 'playwright' })
    });
    assert.strictEqual(pwRes.status, 200);
    const pw = await pwRes.json();
    assert.ok(pw.script.includes('@playwright/test'));

    const selRes = await fetch(`${BASE_URL}/export/script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testCaseId: tc.id, framework: 'selenium' })
    });
    assert.strictEqual(selRes.status, 200);
    const sel = await selRes.json();
    assert.ok(sel.script.includes('org.openqa.selenium'));
  });
});

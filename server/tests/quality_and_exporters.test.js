const test = require('node:test');
const assert = require('node:assert');
const qualityEngine = require('../src/services/QualityEngine');
const automationExporter = require('../src/services/AutomationExporter');
const exportService = require('../src/services/ExportService');
const { cleanAndRepairJson, validateAIOutput, schemas } = require('../src/ai/validator');
const HeuristicQAEngine = require('../src/ai/providers/HeuristicQAEngine');

test('QA Engines, Validators and Exporters Unit Suite', async (t) => {

  await t.test('1. QualityEngine audits and penalizes duplicates & non-testable wording', () => {
    const mockCases = [
      {
        title: 'Verify login works fine and is fast',
        scenario: 'Login scenario',
        preconditions: '',
        expected_result: 'It should work properly',
        steps: ['1. Do login']
      },
      {
        title: 'Verify login works fine and is fast', // Duplicate title!
        scenario: 'Login scenario',
        preconditions: 'Some valid precondition',
        expected_result: 'Valid expected result',
        steps: ['1. Step one', '2. Step two']
      }
    ];

    const report = qualityEngine.evaluate(mockCases);
    assert.ok(report.quality_score <= 85);
    assert.ok(report.metrics.duplicates >= 1);
    assert.strictEqual(report.metrics.missingPreconditions, 1);
    assert.ok(report.metrics.nonTestableLanguageCount > 0);
    assert.ok(report.suggestions.length > 0);
  });

  await t.test('2. QualityEngine gives high score to compliant test suites', () => {
    const mockCases = [
      {
        test_case_id: 'TC-001',
        title: 'Verify successful login with valid credentials',
        scenario: 'Happy path authentication',
        preconditions: 'User test@domain.com exists in DB with active status',
        test_data: 'Email: test@domain.com, Pass: P@ss1234!',
        steps: ['1. Navigate to /login', '2. Fill email and password', '3. Click Sign In'],
        expected_result: 'User is authenticated, receives JWT token, and redirected to /dashboard',
        priority: 'P1-Critical',
        test_type: 'Functional'
      },
      {
        test_case_id: 'TC-002',
        title: 'Verify error when submitting invalid password format',
        scenario: 'Password validation failure',
        preconditions: 'User is on login page',
        test_data: 'Email: test@domain.com, Pass: short',
        steps: ['1. Navigate to /login', '2. Enter invalid pass', '3. Submit form'],
        expected_result: 'Displays inline alert: Password must be at least 8 characters',
        priority: 'P2-High',
        test_type: 'Negative'
      },
      {
        test_case_id: 'TC-003',
        title: 'Verify behavior when email reaches maximum 255 characters boundary',
        scenario: 'Boundary limit checking',
        preconditions: 'User on registration form',
        test_data: 'Email with 255 characters',
        steps: ['1. Fill 255 characters into email input', '2. Click next'],
        expected_result: 'Accepts input without truncation or database error',
        priority: 'P2-High',
        test_type: 'Boundary'
      }
    ];

    const report = qualityEngine.evaluate(mockCases);
    assert.ok(report.quality_score >= 90);
    assert.strictEqual(report.grade, 'A');
    assert.strictEqual(report.metrics.duplicates, 0);
    assert.strictEqual(report.metrics.missingPreconditions, 0);
  });

  await t.test('3. ExportService outputs valid Excel (.xlsx) buffer with all required columns', () => {
    const testCases = [
      {
        test_case_id: 'TC-CMG-001',
        requirement_id: 'REQ-CMG-001',
        module: 'Login',
        feature: 'Password Reset',
        scenario: 'Happy path reset',
        title: 'Verify password reset',
        preconditions: 'User active',
        test_data: 'Email: test@domain.com',
        steps: ['1. Step 1', '2. Step 2'],
        expected_result: 'Password updated',
        priority: 'P1-Critical',
        test_type: 'Functional',
        automation_candidate: true,
        status: 'Approved'
      }
    ];

    const buffer = exportService.exportTestCasesToExcel(testCases);
    assert.ok(Buffer.isBuffer(buffer));
    assert.ok(buffer.length > 500); // Valid xlsx binary header and data

    const csv = exportService.exportTestCasesToCSV(testCases);
    assert.ok(csv.includes('"Test Case ID","Requirement ID","Module","Feature"'));
    assert.ok(csv.includes('"TC-CMG-001","REQ-CMG-001","Login"'));
  });

  await t.test('4. AutomationExporter generates syntax-valid Playwright and Postman collection', () => {
    const tc = {
      test_case_id: 'TC-AUTO-99',
      title: 'Verify campaign creation',
      module: 'Campaign',
      steps: ['Navigate to /campaigns', 'Click Create', 'Submit form'],
      expected_result: 'Campaign created with ID'
    };

    const pw = automationExporter.generatePlaywright(tc);
    assert.ok(pw.includes("import { test, expect } from '@playwright/test';"));
    assert.ok(pw.includes('test.describe'));
    assert.ok(pw.includes('TC-AUTO-99'));

    const postman = automationExporter.generatePostmanCollection([
      {
        api_test_id: 'API-01',
        method: 'POST',
        endpoint: '/api/v1/auth/login',
        request_body: { user: 'test' },
        expected_status_code: 200,
        validation: 'Check status 200'
      }
    ]);
    assert.strictEqual(postman.info.schema, 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json');
    assert.strictEqual(postman.item[0].request.method, 'POST');
  });

  await t.test('5. JSON auto-repair extracts and repairs markdown fences and bad commas', () => {
    const rawAiOutputWithFences = '```json\n{\n  "summary": "Password reset flow",\n  "actors": ["User", "Admin"],\n}\n```';
    const parsed = cleanAndRepairJson(rawAiOutputWithFences);
    assert.strictEqual(parsed.summary, 'Password reset flow');
    assert.strictEqual(parsed.actors.length, 2);
  });

  await t.test('6. HeuristicQAEngine generates high-fidelity data types', async () => {
    const engine = new HeuristicQAEngine();
    const data = await engine.generateTestData({
      field_name: 'phone_number',
      data_type: 'Phone number',
      quantity: 50
    });
    assert.strictEqual(data.records.length, 50);
    assert.ok(data.records.some(r => r.type === 'boundary'));
    assert.ok(data.records.some(r => r.type === 'invalid'));
  });
});

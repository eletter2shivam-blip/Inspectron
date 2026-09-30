const bcrypt = require('bcryptjs');
const db = require('./database');

async function seedDatabase(force = false) {
  const existingProjects = db.find('projects');
  if (existingProjects.length > 0 && !force) {
    console.log('Database already contains data. Skipping seed.');
    return;
  }

  if (force) {
    db.clear();
  }

  console.log('Seeding AI QA Assistant with Inspectron demo data...');

  // 1. Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const users = [
    {
      id: 'usr-lead-001',
      name: 'Sarah Jenkins',
      email: 'lead@inspectron.io',
      password: passwordHash,
      role: 'qa_lead',
      title: 'Principal QA Architect'
    },
    {
      id: 'usr-qa-002',
      name: 'David Chen',
      email: 'qa@inspectron.io',
      password: passwordHash,
      role: 'senior_qa',
      title: 'Senior SDET Engineer'
    },
    {
      id: 'usr-analyst-003',
      name: 'Maya Rodriguez',
      email: 'maya@inspectron.io',
      password: passwordHash,
      role: 'qa_engineer',
      title: 'QA Automation Engineer'
    }
  ];
  db.insertMany('users', users);

  // 1b. RBAC Roles & Permissions
  const roles = [
    { id: 'role-admin', name: 'admin', description: 'System Administrator with full access' },
    { id: 'role-qa-lead', name: 'qa_lead', description: 'QA Lead with approval and configuration authority' },
    { id: 'role-senior-qa', name: 'senior_qa', description: 'Senior SDET Engineer with test design & execution authority' },
    { id: 'role-qa-engineer', name: 'qa_engineer', description: 'QA Engineer with test case creation & execution access' },
    { id: 'role-developer', name: 'developer', description: 'Developer with read and test data access' },
    { id: 'role-viewer', name: 'viewer', description: 'Read-only stakeholder access' }
  ];
  db.insertMany('roles', roles);

  const permissions = [
    { id: 'perm-proj-c', name: 'projects:create' },
    { id: 'perm-proj-r', name: 'projects:read' },
    { id: 'perm-proj-u', name: 'projects:update' },
    { id: 'perm-proj-d', name: 'projects:delete' },
    { id: 'perm-req-c', name: 'requirements:create' },
    { id: 'perm-req-r', name: 'requirements:read' },
    { id: 'perm-req-u', name: 'requirements:update' },
    { id: 'perm-req-d', name: 'requirements:delete' },
    { id: 'perm-tc-c', name: 'testcases:create' },
    { id: 'perm-tc-r', name: 'testcases:read' },
    { id: 'perm-tc-u', name: 'testcases:update' },
    { id: 'perm-tc-d', name: 'testcases:delete' },
    { id: 'perm-tc-a', name: 'testcases:approve' },
    { id: 'perm-api-c', name: 'api_tests:create' },
    { id: 'perm-api-r', name: 'api_tests:read' },
    { id: 'perm-api-e', name: 'api_tests:execute' },
    { id: 'perm-api-d', name: 'api_tests:delete' },
    { id: 'perm-exec-r', name: 'executions:read' },
    { id: 'perm-exec-t', name: 'executions:trigger' },
    { id: 'perm-jira-r', name: 'jira:read' },
    { id: 'perm-jira-c', name: 'jira:configure' },
    { id: 'perm-set-r', name: 'settings:read' },
    { id: 'perm-set-u', name: 'settings:update' },
    { id: 'perm-aud-r', name: 'audit:read' }
  ];
  db.insertMany('permissions', permissions);

  // 1c. Environments
  const environments = [
    {
      id: 'env-dev',
      project_id: 'proj-inspectron-01',
      name: 'Development',
      base_url: 'https://dev-api.inspectron.io',
      is_active: false,
      variables: { baseUrl: 'https://dev-api.inspectron.io', env: 'dev' }
    },
    {
      id: 'env-staging',
      project_id: 'proj-inspectron-01',
      name: 'Staging',
      base_url: 'https://httpbin.org',
      is_active: true,
      variables: { baseUrl: 'https://httpbin.org', env: 'staging' }
    },
    {
      id: 'env-prod',
      project_id: 'proj-inspectron-01',
      name: 'Production',
      base_url: 'https://api.inspectron.io',
      is_active: false,
      variables: { baseUrl: 'https://api.inspectron.io', env: 'prod' }
    }
  ];
  db.insertMany('environments', environments);

  // 2. Demo Project: Inspectron
  const inspectronProject = {
    id: 'proj-inspectron-01',
    name: 'Inspectron',
    description: 'Enterprise AI-driven Multi-channel Campaign Marketing and Attribution Platform',
    application_name: 'Inspectron Cloud SaaS',
    environment: 'Staging / Production',
    technology: 'React, Node.js, GraphQL, PostgreSQL, Redis, Google Ads API, Meta Marketing API',
    modules: [
      'Dashboard',
      'Login',
      'Signup',
      'Campaign',
      'Google Ads',
      'Meta Ads',
      'LinkedIn',
      'Notifications',
      'Reports',
      'Funnel',
      'Support Ticket',
      'User Management'
    ]
  };
  db.insert('projects', inspectronProject);

  // 3. Prompt Versions (Section 19: Modular AI Prompts & Versioning)
  const promptVersions = [
    {
      id: 'prompt-req-v1',
      feature: 'requirement_analysis',
      version: 'v1.2.0',
      is_active: true,
      prompt_template: `Act as a Senior QA Architect and Systems Analyst. Analyze the following software requirement in depth.
Extract and return a structured JSON object containing:
- summary: string
- actors: string[]
- preconditions: string[]
- business_rules: string[]
- functional_requirements: string[]
- non_functional_considerations: string[]
- acceptance_criteria: string[]
- ambiguities: string[] (ambiguous wording or assumptions)
- missing_information: string[] (details developer/QA needs)
- dependencies: string[]
- risks: string[]
- testable_conditions: string[]`
    },
    {
      id: 'prompt-tc-v1',
      feature: 'test_case_generation',
      version: 'v1.3.0',
      is_active: true,
      prompt_template: `Act as a Lead QA Automation Architect. Generate comprehensive, production-grade test cases for the requirement.
Every test case must include: test_case_id, requirement_id, module, feature, scenario, title, preconditions, test_data, steps (array of strings), expected_result, priority (P1-Critical, P2-High, P3-Medium, P4-Low), test_type (Functional, UI, Integration, API, Regression, Smoke, Sanity, Negative, Boundary, Security, Performance, Compatibility), automation_candidate (true/false), and notes.
Ensure deep coverage across positive, negative, boundary, validation, error handling, permission, data integrity, session, and compatibility scenarios without duplicates.`
    },
    {
      id: 'prompt-reg-v1',
      feature: 'regression_generation',
      version: 'v1.1.0',
      is_active: true,
      prompt_template: `Act as a Regression Testing Specialist. Given the updated requirement, existing test cases, and release notes/bug fixes, determine what existing functionality can be impacted (Direct, Indirect, Dependency impact).
Generate structured regression test cases with: regression_id, affected_module, related_requirement, scenario, steps, expected_result, priority, reason_for_regression, and classification (Critical Regression, High Regression, Medium Regression, Low Regression).`
    },
    {
      id: 'prompt-api-v1',
      feature: 'api_test_generation',
      version: 'v1.2.0',
      is_active: true,
      prompt_template: `Act as an API Testing & RestAssured / Postman Expert. Generate structured API test cases for the given endpoint, method, headers, and payload.
Cover: Positive, Negative, Authentication, Authorization, Validation, Boundary, Missing parameters, Invalid JSON, Incorrect data types, Duplicate request, Rate limit, Timeout, 5xx server errors, Response schema validation, Response headers.
Provide Postman test script snippets for assertions.`
    },
    {
      id: 'prompt-edge-v1',
      feature: 'edge_case_detection',
      version: 'v1.2.0',
      is_active: true,
      prompt_template: `Act as an Adversarial QA Hacker and Boundary Condition Specialist. Analyze the requirement and existing tests to identify subtle, complex, and unhandled edge cases across:
Empty/null values, max/min limits, unicode/special characters, duplicate submissions, concurrent actions & race conditions, network failures, timeouts, session expirations, RBAC permissions, large data volume, pagination anomalies, and dependency outages.
For each edge case, provide: missing_scenario, why_it_matters, suggested_test_case, risk_level (High, Medium, Low).`
    },
    {
      id: 'prompt-data-v1',
      feature: 'test_data_generation',
      version: 'v1.1.0',
      is_active: true,
      prompt_template: `Act as a Data Quality Architect. Generate realistic, synthetic, privacy-safe test data matching the specified schema, rules, and quantity.
Include: valid, invalid, boundary, negative, and edge-case values. Never output real individuals' PII.`
    },
    {
      id: 'prompt-bug-v1',
      feature: 'bug_analysis',
      version: 'v1.2.0',
      is_active: true,
      prompt_template: `Act as a Root Cause Analysis & Quality Specialist. Convert the reported defect into:
- bug_summary: string
- root_cause_hypothesis: string
- affected_module: string
- affected_functionality: string
- reproduction_scenario: string
- original_test_scenario: string
- regression_test_scenario: string
- negative_scenario: string
- related_test_cases: string[]
- risk_areas: string[]
- suggested_additional_tests: string[]
- regression_test_cases: array of test case objects.`
    },
    {
      id: 'prompt-cov-v1',
      feature: 'coverage_analysis',
      version: 'v1.0.0',
      is_active: true,
      prompt_template: `Act as a QA Traceability Lead. Analyze requirement coverage against test cases. Calculate complete, partial, or missing coverage, identify untested acceptance criteria, and highlight risk levels.`
    },
    {
      id: 'prompt-qual-v1',
      feature: 'test_case_quality_review',
      version: 'v1.1.0',
      is_active: true,
      prompt_template: `Act as a QA Review Board Inspector. Audit test cases for duplicate scenarios, missing preconditions or expected results, unclear steps, non-testable language, missing negative/boundary coverage, and improper priorities. Return an overall quality_score (0-100) and actionable suggestions.`
    }
  ];
  db.insertMany('prompt_versions', promptVersions);

  // 4. App Settings
  db.insert('app_settings', {
    id: 'setting-ai-provider',
    key: 'ai_provider',
    value: 'hybrid', // 'hybrid' tries Gemini API if key is present, falls back gracefully to HeuristicQAEngine
    description: 'AI Processing Mode: Hybrid / Gemini API / Offline Engine'
  });
  db.insert('app_settings', {
    id: 'setting-ai-model',
    key: 'ai_model',
    value: 'gemini-3.8-flash',
    description: 'Primary AI Model for QA Generation'
  });

  console.log('Seed completed successfully! Clean Inspectron workspace is ready.');
}

if (require.main === module) {
  seedDatabase(true).then(() => process.exit(0)).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };

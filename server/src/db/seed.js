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

  // 4. Sample Requirements for Inspectron
  const req1 = {
    id: 'REQ-CMG-001',
    project_id: 'proj-inspectron-01',
    title: 'Self-Service Password Reset via Secure Email Link',
    source: 'Jira (CMG-104)',
    status: 'Analyzed',
    raw_text: 'As a registered Inspectron user, I want to reset my password using my registered email so that I can securely regain access to my campaign dashboard if I forget my credentials. The link should expire in 15 minutes, allow only 1 reset per token, and require a strong password (min 8 chars, 1 uppercase, 1 special char, 1 number). Rate limit reset requests to 3 per hour per IP/email.',
    analysis_result: {
      summary: 'Self-service password reset workflow initiating a 15-minute cryptographically secure single-use token sent to verified email, with rate limiting and strict complexity validation.',
      actors: ['Registered Inspectron User', 'Unregistered User / Attacker', 'Identity Auth Service', 'SendGrid Mailer Service'],
      preconditions: [
        'User account exists in Inspectron PostgreSQL database',
        'User account is not suspended or soft-deleted',
        'SendGrid SMTP/API relay is healthy and reachable'
      ],
      business_rules: [
        'Password reset token lifetime must strictly be 15 minutes',
        'Token must be single-use and invalidated immediately upon successful password change',
        'Rate limit to maximum 3 password reset requests per hour per email/IP',
        'Generic response ("If this email exists, a reset link has been sent") to prevent user enumeration attacks',
        'New password must meet: min 8 chars, 1 uppercase, 1 special character, 1 number',
        'New password cannot match any of the previous 3 historical passwords'
      ],
      functional_requirements: [
        'Render "Forgot Password" form with email validation',
        'Generate secure CSPRNG 256-bit token stored hashed in DB with expiry timestamp',
        'Send responsive HTML email with embedded reset URL containing token parameter',
        'Validate token validity, expiration, and prior usage on landing page',
        'Update password with bcrypt (work factor >= 12) upon valid form submission',
        'Revoke all existing active user sessions/JWTs upon successful reset'
      ],
      non_functional_considerations: [
        'Email delivery P95 latency under 5 seconds',
        'CSPRNG cryptographic entropy for token generation',
        'Zero timing attack leakage in user existence check'
      ],
      acceptance_criteria: [
        'AC-1: Valid email receives reset link within 60s',
        'AC-2: Clicking expired link (>15m) renders descriptive error with "Request new link" action',
        'AC-3: Reusing already used token fails with 400 Bad Request',
        'AC-4: Submitting password without special character shows inline validation error',
        'AC-5: 4th request within 1 hour triggers HTTP 429 Too Many Requests'
      ],
      ambiguities: [
        'Does changing the password immediately revoke existing OAuth2 refresh tokens or Google/Meta connected integrations?',
        'Should user be automatically logged in after successful reset or redirected to /login?'
      ],
      missing_information: [
        'Specific copy and branding for the reset email template',
        'Whether admin accounts require mandatory 2FA prompt during reset'
      ],
      dependencies: [
        'Identity & Authentication Service (JWT/Session provider)',
        'Redis cache for rate limiting bucket counter',
        'Transactional Email Gateway (SendGrid/AWS SES)'
      ],
      risks: [
        'Account takeover via token replay or brute force if entropy is weak',
        'Email spoofing/phishing if domain DKIM/SPF is misconfigured',
        'User enumeration via HTTP response timing discrepancies'
      ],
      testable_conditions: [
        'Token expiration boundary at exactly 14m59s vs 15m01s',
        'Concurrent password reset requests with identical token',
        'XSS injection in email address field',
        'Special characters (UTF-8 emoji, accented glyphs) in password field'
      ]
    }
  };

  const req2 = {
    id: 'REQ-CMG-002',
    project_id: 'proj-inspectron-01',
    title: 'Omnichannel Campaign Creation with Google Ads & Meta Ads Sync',
    source: 'PRD-Campaign-Engine',
    status: 'Analyzed',
    raw_text: 'As an agency marketing lead, I want to create a unified marketing campaign in Inspectron and simultaneously push budgets, audiences, and ad creative to Google Ads and Meta Ads Manager, so that I can manage omnichannel campaigns from one single dashboard without context switching.',
    analysis_result: {
      summary: 'Centralized campaign publishing pipeline that maps unified creative and budget payloads into Google Ads API v16 and Meta Marketing API v19, handling async sync jobs and rollbacks.',
      actors: ['Marketing Campaign Manager', 'Agency Admin', 'Google Ads API Client', 'Meta Graph API Client'],
      preconditions: [
        'User has authenticated OAuth2 connections for both Google Ads and Meta Ads',
        'Target ad accounts have active billing profiles and admin permissions',
        'Inspectron campaign budget is >= $5.00/day minimum threshold'
      ],
      business_rules: [
        'Total budget must be allocated in positive integer cents',
        'Google Ads requires responsive search ad assets (min 3 headlines, 2 descriptions)',
        'Meta Ads requires 1 primary text, 1 headline, and aspect ratio 1:1 or 9:16 asset',
        'If one platform fails while the other succeeds, trigger partial-success status with automated retry or rollback option'
      ],
      functional_requirements: [
        'Unified campaign configuration wizard with step-by-step validation',
        'Asset upload to S3/GCS with automated resizing and format checks',
        'Async job dispatch using Redis bullmq queue for platform sync',
        'Real-time WebSocket progress reporting to user dashboard'
      ],
      non_functional_considerations: [
        'Sync completion within 15 seconds under normal API quota limits',
        'Secure storage of OAuth2 refresh tokens using AES-256-GCM'
      ],
      acceptance_criteria: [
        'AC-1: Successfully provisions campaign on both Google and Meta when inputs are valid',
        'AC-2: Gracefully handles Meta API rate limit (error code 17/613) with exponential backoff',
        'AC-3: Informs user if image dimensions do not conform to Meta 1:1 or 9:16 aspect ratios'
      ],
      ambiguities: [
        'How should currency conversions be handled if Google Ads is in USD and Meta Ads is in EUR?'
      ],
      missing_information: [
        'Maximum allowed file upload size for video creatives'
      ],
      dependencies: ['Google Ads API v16', 'Meta Graph API v19', 'Redis Queue', 'Cloud Object Storage'],
      risks: ['Third-party API rate limiting during high-volume campaign launches', 'Budget overspend during race condition updates'],
      testable_conditions: ['Zero budget submission', 'Network disconnect midway through async sync', 'Expired OAuth2 token during publish']
    }
  };

  db.insert('requirements', req1);
  db.insert('requirements', req2);

  // 5. Sample Jira Issues
  const jiraIssue = {
    id: 'jira-cmg-104',
    project_id: 'proj-inspectron-01',
    issue_key: 'CMG-104',
    summary: 'Implement secure self-service password reset flow with 15min expiry',
    description: 'We need to implement a secure password reset flow using single-use 15min tokens as outlined in Security PRD v2. Rate limiting must prevent brute-force attacks.',
    acceptance_criteria: '1. User receives email with token within 60s\n2. Token expires after 15 minutes\n3. Token is invalidated on first use\n4. Password complexity strictly enforced\n5. Max 3 requests/hour per email',
    comments: [
      { author: 'alex.sdet', body: 'Please ensure we handle user enumeration prevention with constant-time response.' },
      { author: 'security.lead', body: 'Approved. Make sure all sessions are revoked on reset.' }
    ],
    labels: ['security', 'auth', 'release-2.4', 'backend'],
    priority: 'High',
    components: ['Auth Service', 'Mailer Service', 'Frontend-Web'],
    status: 'In Progress',
    raw_data: { key: 'CMG-104', issuetype: { name: 'Story' } }
  };
  db.insert('jira_issues', jiraIssue);

  // 6. Sample Structured Test Cases (All fields from Section 6)
  const testCases = [
    {
      id: 'TC-CMG-001',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-001',
      module: 'Login',
      feature: 'Password Reset',
      scenario: 'Successful password reset with valid email and strong password',
      title: 'Verify user can successfully reset password using valid link and compliant credentials',
      preconditions: 'User test.user@inspectron.io exists in database with status=ACTIVE and verified email.',
      test_data: 'Email: test.user@inspectron.io, New Password: "P@ssword2026!Cm"',
      steps: [
        '1. Navigate to https://app.inspectron.io/login',
        '2. Click "Forgot Password" link',
        '3. Enter registered email "test.user@inspectron.io" and click "Send Reset Link"',
        '4. Open received email in inbox and click the reset URL',
        '5. On password reset page, enter "P@ssword2026!Cm" in New Password and Confirm Password',
        '6. Click "Update Password" button'
      ],
      expected_result: 'User receives success toast "Password reset successfully", redirected to /login, and can log in with new credentials. Prior active sessions are terminated.',
      priority: 'P1-Critical',
      test_type: 'Functional',
      automation_candidate: true,
      notes: 'Happy path test case. Core regression test candidate.',
      status: 'Approved',
      quality_score: 98
    },
    {
      id: 'TC-CMG-002',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-001',
      module: 'Login',
      feature: 'Password Reset',
      scenario: 'Attempt password reset with expired token (>15 minutes)',
      title: 'Verify password reset fails and shows error when reset link has expired past 15 minutes',
      preconditions: 'A password reset token was requested at T-16 minutes and has expired.',
      test_data: 'Expired token: "tkn_exp_9a8b7c6d5e4f3a2b1"',
      steps: [
        '1. Open browser with expired reset URL https://app.inspectron.io/reset-password?token=tkn_exp_9a8b7c6d5e4f3a2b1',
        '2. Verify page displays token expiration alert banner',
        '3. Enter valid new password and submit form'
      ],
      expected_result: 'System blocks submission, displays alert "This password reset link has expired. Please request a new one", and renders "Request New Link" button.',
      priority: 'P2-High',
      test_type: 'Boundary',
      automation_candidate: true,
      notes: 'Boundary condition test for token lifetime.',
      status: 'Approved',
      quality_score: 95
    },
    {
      id: 'TC-CMG-003',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-001',
      module: 'Login',
      feature: 'Password Reset',
      scenario: 'Token replay attack - attempt to reuse already consumed reset token',
      title: 'Verify password reset token cannot be reused once password has already been changed',
      preconditions: 'Token was previously used to change password 2 minutes ago.',
      test_data: 'Used token: "tkn_used_11223344556677"',
      steps: [
        '1. Re-open reset URL https://app.inspectron.io/reset-password?token=tkn_used_11223344556677',
        '2. Attempt to input new password and submit'
      ],
      expected_result: 'API returns HTTP 400 Bad Request with error "Token has already been consumed". Form is disabled.',
      priority: 'P1-Critical',
      test_type: 'Security',
      automation_candidate: true,
      notes: 'OWASP ASVS compliance verification for session/token management.',
      status: 'Approved',
      quality_score: 96
    },
    {
      id: 'TC-CMG-004',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-001',
      module: 'Login',
      feature: 'Password Reset',
      scenario: 'Password complexity validation failure (missing special character)',
      title: 'Verify inline validation error when submitted password lacks required special character',
      preconditions: 'User is on active reset password page with valid token.',
      test_data: 'Invalid Password: "WeakPassword2026"',
      steps: [
        '1. Focus on "New Password" input field',
        '2. Enter "WeakPassword2026"',
        '3. Observe dynamic password strength indicator and error text',
        '4. Click "Update Password" button'
      ],
      expected_result: 'Submit button remains disabled or click shows validation error: "Password must contain at least one special character (!@#$%^&*)"',
      priority: 'P2-High',
      test_type: 'Negative',
      automation_candidate: true,
      notes: 'Client-side and server-side validation check.',
      status: 'Approved',
      quality_score: 94
    },
    {
      id: 'TC-CMG-005',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-001',
      module: 'Login',
      feature: 'Rate Limiting',
      scenario: 'Exceeding maximum allowed password reset requests (rate limit trigger)',
      title: 'Verify rate limiting triggers HTTP 429 when submitting >3 reset requests within 1 hour',
      preconditions: 'Client IP/email has already dispatched 3 reset requests within the last 15 minutes.',
      test_data: 'Email: test.user@inspectron.io, Request count: 4',
      steps: [
        '1. Submit 4th password reset request for test.user@inspectron.io',
        '2. Inspect network tab and UI response'
      ],
      expected_result: 'API returns HTTP 429 with header "Retry-After: 3600". UI shows "Too many requests. Please try again in 1 hour."',
      priority: 'P1-Critical',
      test_type: 'Security',
      automation_candidate: true,
      notes: 'Protection against email spam and resource exhaustion.',
      status: 'Approved',
      quality_score: 97
    },
    {
      id: 'TC-CMG-006',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-002',
      module: 'Campaign',
      feature: 'Omnichannel Publishing',
      scenario: 'Successful dual-sync campaign launch to Google Ads and Meta Ads',
      title: 'Verify unified campaign is successfully created and synced to both Google and Meta ad managers',
      preconditions: 'Google and Meta accounts connected with active billing and valid OAuth tokens.',
      test_data: 'Campaign Name: "Q3 SaaS Growth", Daily Budget: $250.00, Channels: ["Google Ads", "Meta Ads"]',
      steps: [
        '1. Navigate to Campaigns > "Create Campaign"',
        '2. Enter campaign name, select channels [Google Ads, Meta Ads], set daily budget $250.00',
        '3. Upload 1:1 image banner and provide 3 headlines and 2 descriptions',
        '4. Click "Publish Campaign"'
      ],
      expected_result: 'Campaign status transitions to "Publishing", async worker synchronizes entities, and both Google Ads campaign ID and Meta Ads adset ID are stored and visible with status "Active".',
      priority: 'P1-Critical',
      test_type: 'Integration',
      automation_candidate: true,
      notes: 'End-to-end multi-channel campaign publishing flow.',
      status: 'Approved',
      quality_score: 96
    },
    {
      id: 'TC-CMG-007',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-002',
      module: 'Campaign',
      feature: 'Google Ads',
      scenario: 'Validation failure when Google Ads responsive ad has fewer than 3 headlines',
      title: 'Verify campaign cannot be published to Google Ads when fewer than 3 headlines are provided',
      preconditions: 'User is on Step 3 (Creative) of Campaign Builder.',
      test_data: 'Headlines provided: ["Headline One", "Headline Two"] (Only 2 headlines)',
      steps: [
        '1. Select Google Ads channel in Campaign Builder',
        '2. Fill in only 2 headlines in the asset form',
        '3. Attempt to proceed to next step'
      ],
      expected_result: 'Validation error displayed: "Google Ads requires at least 3 distinct headlines. Please provide 1 more."',
      priority: 'P3-Medium',
      test_type: 'Validation',
      automation_candidate: true,
      notes: 'Platform-specific creative validation rule.',
      status: 'Approved',
      quality_score: 93
    }
  ];
  db.insertMany('test_cases', testCases);

  // 6b. Test Case Versions (Audit snapshot)
  const testCaseVersions = testCases.map(tc => ({
    id: `ver-${tc.id}-1`,
    test_case_id: tc.id,
    version: 1,
    snapshot: tc,
    change_reason: 'Initial baseline creation',
    changed_by: 'usr-lead-001',
    created_at: new Date().toISOString()
  }));
  db.insertMany('test_case_versions', testCaseVersions);

  // 7. Sample API Test Cases (Section 8)
  const apiTests = [
    {
      id: 'api-tc-001',
      project_id: 'proj-inspectron-01',
      api_test_id: 'API-CMG-001',
      method: 'POST',
      endpoint: '/api/v1/auth/password-reset-request',
      headers: { 'Content-Type': 'application/json' },
      query_params: {},
      path_params: {},
      request_body: { email: 'test.user@inspectron.io' },
      test_data: 'Valid registered email in body',
      expected_status_code: 200,
      expected_response: { success: true, message: 'If an account exists, a reset link has been dispatched.' },
      validation: 'Status is 200, response time < 800ms, message is generic to avoid enumeration.',
      priority: 'P1-Critical',
      postman_script: `pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Response contains generic security message", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.message).to.include("reset link has been dispatched");
});`
    },
    {
      id: 'api-tc-002',
      project_id: 'proj-inspectron-01',
      api_test_id: 'API-CMG-002',
      method: 'POST',
      endpoint: '/api/v1/auth/reset-password',
      headers: { 'Content-Type': 'application/json' },
      query_params: {},
      path_params: {},
      request_body: {
        token: 'invalid_or_expired_token_123',
        new_password: 'P@ssword2026!Cm'
      },
      test_data: 'Malformed/expired token',
      expected_status_code: 400,
      expected_response: { error: 'INVALID_OR_EXPIRED_TOKEN', message: 'Token is invalid or has expired.' },
      validation: 'Status code 400 Bad Request with standardized error envelope.',
      priority: 'P1-Critical',
      postman_script: `pm.test("Status code is 400 Bad Request", function () {
    pm.response.to.have.status(400);
});
pm.test("Error code matches contract", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.error).to.eql("INVALID_OR_EXPIRED_TOKEN");
});`
    },
    {
      id: 'api-tc-003',
      project_id: 'proj-inspectron-01',
      api_test_id: 'API-CMG-003',
      method: 'POST',
      endpoint: '/api/v1/campaigns',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{jwt_token}}'
      },
      query_params: {},
      path_params: {},
      request_body: {
        name: 'Omnichannel Launch 2026',
        daily_budget_cents: 25000,
        channels: ['GOOGLE_ADS', 'META_ADS'],
        creative: {
          headline: 'Boost Your ROI',
          asset_url: 'https://cdn.inspectron.io/assets/creative_1.png'
        }
      },
      test_data: 'Valid campaign creation payload with auth token',
      expected_status_code: 201,
      expected_response: { id: 'cmp_9921', status: 'QUEUED_FOR_SYNC' },
      validation: 'Status 201 Created, returns generated campaign ID and status=QUEUED_FOR_SYNC.',
      priority: 'P1-Critical',
      postman_script: `pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
pm.test("Response contains campaign ID", function () {
    var data = pm.response.json();
    pm.expect(data).to.have.property('id');
    pm.expect(data.status).to.eql('QUEUED_FOR_SYNC');
});`
    }
  ];
  db.insertMany('api_tests', apiTests);

  // 7b. API Executions History
  const apiExecutions = [
    {
      id: 'exec-seed-001',
      api_test_case_id: 'api-tc-001',
      project_id: 'proj-inspectron-01',
      status: 'PASSED',
      response_status: 200,
      response_time_ms: 124,
      response_headers: { 'content-type': 'application/json' },
      response_body: { success: true, message: 'If an account exists, a reset link has been dispatched.' },
      assertion_results: [
        { name: 'Status code is 200', passed: true, actual: 200, expected: 200 },
        { name: 'Response time under 2000ms', passed: true, actual: '124ms', expected: '< 2000ms' }
      ],
      executed_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'exec-seed-002',
      api_test_case_id: 'api-tc-002',
      project_id: 'proj-inspectron-01',
      status: 'PASSED',
      response_status: 400,
      response_time_ms: 88,
      response_headers: { 'content-type': 'application/json' },
      response_body: { error: 'INVALID_OR_EXPIRED_TOKEN', message: 'Token is invalid or has expired.' },
      assertion_results: [
        { name: 'Status code is 400', passed: true, actual: 400, expected: 400 },
        { name: 'Response time under 2000ms', passed: true, actual: '88ms', expected: '< 2000ms' }
      ],
      executed_at: new Date(Date.now() - 1800000).toISOString()
    }
  ];
  db.insertMany('api_executions', apiExecutions);

  // 8. Sample Regression Tests (Section 7)
  const regressionTests = [
    {
      id: 'reg-cmg-001',
      project_id: 'proj-inspectron-01',
      regression_id: 'REG-CMG-001',
      affected_module: 'Login',
      related_requirement: 'REQ-CMG-001',
      scenario: 'Existing active session invalidation after password reset',
      steps: [
        '1. Log into Inspectron on Device A (Session 1) and Device B (Session 2)',
        '2. On Device A, initiate and complete password reset',
        '3. On Device B, refresh page and attempt to fetch /api/v1/user/profile'
      ],
      expected_result: 'Device B receives 401 Unauthorized because all previous JWT sessions were revoked upon password change.',
      priority: 'P1-Critical',
      reason_for_regression: 'Security fix introduced session-invalidation revocation list in Redis; must verify active sessions are destroyed.',
      classification: 'Critical Regression',
      impact_type: 'Direct impact'
    },
    {
      id: 'reg-cmg-002',
      project_id: 'proj-inspectron-01',
      affected_module: 'User Management',
      related_requirement: 'REQ-CMG-001',
      scenario: 'Admin manual password reset trigger should not bypass rate limit counter',
      steps: [
        '1. Login as Org Admin',
        '2. Navigate to User Management > Select user > Click "Send Password Reset"',
        '3. Confirm email is received by user with standard 15-minute token'
      ],
      expected_result: 'Admin trigger successfully sends email without corrupting user audit history.',
      priority: 'P2-High',
      reason_for_regression: 'User management and self-service password reset share the underlying AuthMailerService pipeline.',
      classification: 'High Regression',
      impact_type: 'Indirect impact'
    },
    {
      id: 'reg-cmg-003',
      project_id: 'proj-inspectron-01',
      affected_module: 'Google Ads',
      related_requirement: 'REQ-CMG-002',
      scenario: 'Existing running campaigns budget sync integrity when new campaign is added',
      steps: [
        '1. Verify active Google Ads campaign CMP-010 is serving ads with budget $100',
        '2. Launch new campaign CMP-011 via Omnichannel builder',
        '3. Check Google Ads API report for CMP-010'
      ],
      expected_result: 'Existing campaign budget is unchanged and account shared budget cap is respected.',
      priority: 'P2-High',
      reason_for_regression: 'Omnichannel builder modified shared Google Ads customer client initialization logic.',
      classification: 'High Regression',
      impact_type: 'Dependency impact'
    }
  ];
  db.insertMany('regression_tests', regressionTests);

  // 9. Sample Bug (Section 11)
  const sampleBug = {
    id: 'bug-cmg-201',
    project_id: 'proj-inspectron-01',
    title: 'Meta Ads OAuth Token Expiration Causes Silent Sync Failures Without Notification',
    description: 'When a connected Meta Ads account token expires or permissions are revoked by user on Facebook, Inspectron campaign creation enters an infinite retry loop without alerting the marketing manager or updating the UI error badge.',
    steps_to_reproduce: '1. Connect Meta Ads account\n2. In Facebook Business Manager, revoke app permissions\n3. In Inspectron, create new campaign targeting Meta Ads\n4. Click Publish Campaign',
    expected_result: 'Sync worker detects token revocation (Meta code 190), halts retry loop, marks campaign as "Sync Error: Token Expired", and triggers notification toast and email.',
    actual_result: 'Campaign remains stuck in "Publishing (45%)" indefinitely. Worker logs flooded with unhandled 400 Bad Request.',
    environment: 'Staging & Production',
    browser: 'Chrome 128 / macOS 14.5',
    device: 'Desktop',
    build_version: 'v2.4.1-rc3',
    analysis_result: {
      bug_summary: 'Meta Ads OAuth token invalidation triggers unhandled promise rejection in async sync worker, causing silent stalling and missing user alert.',
      root_cause_hypothesis: 'The worker exception handler fails to catch Meta Graph error code 190 (Invalid OAuth 2.0 Access Token) specifically, classifying it as a generic retryable network timeout instead of a non-retryable auth revocation.',
      affected_module: 'Meta Ads',
      affected_functionality: 'Campaign Sync Worker & Notifications',
      reproduction_scenario: 'Revoke Facebook OAuth token during active campaign sync dispatch.',
      original_test_scenario: 'Verify campaign sync displays error when token is invalid upon initial check.',
      regression_test_scenario: 'Ensure that any third-party 401/OAuth revocation immediately transitions campaign to "AUTH_EXPIRED" state and fires high-priority in-app notification.',
      negative_scenario: 'Execute sync with expired token, corrupted token, and empty token to ensure deterministic error handling.',
      related_test_cases: ['TC-CMG-006', 'API-CMG-003'],
      risk_areas: ['Silent failure of client ad spend', 'Worker queue memory leak from infinite retries'],
      suggested_additional_tests: [
        'Automated token health check cron test',
        'Meta Ads API rate limit vs token expiry discriminator test'
      ]
    },
    regression_scenarios: [
      {
        regression_id: 'REG-BUG-201',
        affected_module: 'Meta Ads',
        scenario: 'Verify Meta OAuth Token revocation stops sync immediately and notifies user',
        steps: '1. Mock Meta API 400 error code 190\n2. Trigger campaign publish\n3. Verify campaign status is AUTH_EXPIRED within 3 seconds\n4. Check notification bell has alert',
        expected_result: 'Immediate graceful failure, no infinite loop, user notified.',
        priority: 'P1-Critical',
        classification: 'Critical Regression'
      }
    ]
  };
  db.insert('bugs', sampleBug);

  // 10. Sample Test Data Sets (Section 10)
  const testDataSet = {
    id: 'tds-cmg-001',
    project_id: 'proj-inspectron-01',
    name: 'Inspectron User Auth & Email Test Set',
    field_name: 'email',
    data_type: 'Email',
    format: 'RFC 5322 Compliant & Edge Cases',
    quantity: 10,
    records: [
      { id: 1, type: 'valid', value: 'alex.rivera@enterprise-corp.com', note: 'Standard corporate domain' },
      { id: 2, type: 'valid', value: 'qa.test+tag99@inspectron.io', note: 'Plus addressing tag' },
      { id: 3, type: 'boundary', value: 'a@b.co', note: 'Minimum valid RFC email length' },
      { id: 4, type: 'boundary', value: 'user_with_very_long_local_part_exceeding_standard_typical_name@subdomain.domain.org', note: '64 char local part limit' },
      { id: 5, type: 'invalid', value: 'missing-at-sign.domain.com', note: 'Missing @ symbol' },
      { id: 6, type: 'invalid', value: 'user@.domain.com', note: 'Leading dot in domain' },
      { id: 7, type: 'negative', value: 'user@domain..com', note: 'Consecutive dots in host' },
      { id: 8, type: 'negative', value: '<script>alert(1)</script>@inspectron.io', note: 'XSS injection attempt' },
      { id: 9, type: 'random', value: 'k7f2910_mock@cloud-sandbox.net', note: 'Randomized synthetic address' },
      { id: 10, type: 'realistic', value: 'david.chen@inspectron.io', note: 'Realistic demo engineer' }
    ]
  };
  db.insert('test_data_sets', testDataSet);

  // 11. Traceability & Coverage Matrix (Section 12)
  const coverageRecords = [
    {
      id: 'cov-001',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-001',
      requirement_title: 'Self-Service Password Reset via Secure Email Link',
      test_case_ids: ['TC-CMG-001', 'TC-CMG-002', 'TC-CMG-003', 'TC-CMG-004', 'TC-CMG-005'],
      coverage_status: 'Complete',
      coverage_percentage: 100,
      missing_coverage: 'None. Positive, negative, boundary, security, and rate limiting covered.',
      risk: 'Low'
    },
    {
      id: 'cov-002',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-002',
      requirement_title: 'Omnichannel Campaign Creation with Google Ads & Meta Ads Sync',
      test_case_ids: ['TC-CMG-006', 'TC-CMG-007'],
      coverage_status: 'Partial',
      coverage_percentage: 65,
      missing_coverage: 'Need specific boundary tests for Meta Ads video format size limits and partial-rollback scenarios.',
      risk: 'Medium'
    }
  ];
  db.insertMany('coverage_records', coverageRecords);

  // 12. Mock Jira Configuration (Section 5)
  const jiraConfig = {
    id: 'jira-cfg-01',
    project_id: 'proj-inspectron-01',
    jira_url: 'https://inspectron.atlassian.net',
    username: 'qa-automation@inspectron.io',
    api_token_masked: '••••••••••••••••••••••••3a9F',
    project_key: 'CMG',
    connected: true
  };
  db.insert('jira_configs', jiraConfig);

  // 13. AI Generations Log (Section 18)
  const aiHistory = [
    {
      id: 'ai-hist-001',
      project_id: 'proj-inspectron-01',
      feature: 'Requirement Analysis',
      input_type: 'User Story Text',
      input_payload: 'As a registered Inspectron user, I want to reset my password using my registered email...',
      generated_output: req1.analysis_result,
      user_id: 'usr-lead-001',
      user_name: 'Sarah Jenkins',
      ai_model: 'gemini-3.8-flash',
      prompt_version: 'v1.2.0',
      execution_time_ms: 1420
    },
    {
      id: 'ai-hist-002',
      project_id: 'proj-inspectron-01',
      feature: 'Test Case Generation',
      input_type: 'Requirement ID: REQ-CMG-001',
      input_payload: 'Generated comprehensive test matrix for REQ-CMG-001',
      generated_output: testCases.slice(0, 5),
      user_id: 'usr-qa-002',
      user_name: 'David Chen',
      ai_model: 'gemini-3.8-flash',
      prompt_version: 'v1.3.0',
      execution_time_ms: 2150
    }
  ];
  db.insertMany('ai_generations', aiHistory);

  // 14. Audit Logs (Section 22)
  const auditLogs = [
    {
      id: 'log-001',
      user_id: 'usr-lead-001',
      action: 'PROJECT_INITIALIZED',
      entity: 'Project',
      entity_id: 'proj-inspectron-01',
      details: 'Created Inspectron demo workspace with 12 modules',
      ip_address: '127.0.0.1'
    },
    {
      id: 'log-002',
      user_id: 'usr-qa-002',
      action: 'TEST_CASES_GENERATED',
      entity: 'TestCase',
      entity_id: 'REQ-CMG-001',
      details: 'Generated 5 structured test cases for Password Reset flow',
      ip_address: '127.0.0.1'
    }
  ];
  db.insertMany('audit_logs', auditLogs);

  // 15. Settings
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

  // 16. Edge Cases
  const edgeCases = [
    {
      id: 'edge-001',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-001',
      title: 'Zero-width whitespace and Unicode normalization in email input',
      category: 'Data & Input Validation',
      risk_level: 'High',
      preconditions: 'User registers email containing invisible zero-width space characters',
      steps: [
        '1. Enter email containing zero-width non-joiner U+200C',
        '2. Request password reset',
        '3. Inspect normalized email lookup in database query'
      ],
      expected_behavior: 'Input sanitization strips zero-width spaces or rejects input without throwing unhandled exception.',
      promoted: false
    },
    {
      id: 'edge-002',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-001',
      title: 'Concurrent password resets submitted within 5ms window',
      category: 'Concurrency & Race Conditions',
      risk_level: 'High',
      preconditions: 'Two identical reset requests hit API gateway simultaneously',
      steps: [
        '1. Send 2 parallel HTTP POST requests with exact same token',
        '2. Verify database transaction isolation level'
      ],
      expected_behavior: 'Atomic single-use token invalidation; exactly 1 succeeds, second fails with 400 Bad Request.',
      promoted: false
    },
    {
      id: 'edge-003',
      project_id: 'proj-inspectron-01',
      requirement_id: 'REQ-CMG-002',
      title: 'Meta Ads API outage during dual-platform campaign commit',
      category: 'Network & Service Outage',
      risk_level: 'Critical',
      preconditions: 'Google Ads campaign creates successfully, Meta Graph returns HTTP 503',
      steps: [
        '1. Initiate campaign publish targeting both platforms',
        '2. Mock Meta API 503 Service Unavailable',
        '3. Verify compensatory transaction/rollback'
      ],
      expected_behavior: 'Platform pauses Google Ads campaign and flags campaign as "PARTIAL_SYNC_ERROR" with user retry button.',
      promoted: false
    }
  ];
  db.insertMany('edge_cases', edgeCases);

  // 17. AI Token Usage & Cost Attribution
  const aiUsage = [
    {
      id: 'usage-001',
      user_id: 'usr-lead-001',
      project_id: 'proj-inspectron-01',
      feature: 'testcases:generate',
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      prompt_tokens: 840,
      completion_tokens: 1250,
      total_tokens: 2090,
      duration_ms: 1620,
      cost_usd: 0.00045,
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'usage-002',
      user_id: 'usr-qa-002',
      project_id: 'proj-inspectron-01',
      feature: 'requirements:analyze',
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      prompt_tokens: 520,
      completion_tokens: 980,
      total_tokens: 1500,
      duration_ms: 1340,
      cost_usd: 0.00032,
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];
  db.insertMany('ai_usage', aiUsage);

  console.log('Seed completed successfully! Inspectron demo project is ready.');
}

if (require.main === module) {
  seedDatabase(true).then(() => process.exit(0)).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };

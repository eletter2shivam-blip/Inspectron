# Inspectron QA - Backend Architecture & Implementation Plan

## 1. Executive Summary & Existing Architecture Inspection

Inspectron QA is an enterprise autonomous Quality Engineering platform designed to analyze software requirements, Jira tickets, APIs, and bugs, and synthesize high-grade test cases, regression matrices, synthetic test data, and automated execution scripts.

### 1.1 Existing Architecture Inspection
- **Frontend Stack**:
  - React 18.3.1 Single Page Application built with Vite 5.4.x and Tailwind CSS 3.4.x.
  - State Management: React Context API (`AuthContext`, `ProjectContext`, `ToastContext`).
  - Icons & UI: Lucide React (`lucide-react`), Plus Jakarta Sans font, Tailwind Glassmorphism design system.
  - API Client: Centralized `ApiClient` class in `client/src/api/client.js` with relative `/api` base URL, JWT bearer injection, custom headers, and session expiration events.
  - Deployment: Vercel static asset hosting (`client/dist`) with SPA rewrite rules in `vercel.json`.
- **Current Backend Stack**:
  - Node.js (v24.x LTS runtime) and Express 4.x.
  - Entry point: `server/src/index.js` (and serverless wrapper `api/index.js`).
  - Auth: JWT (`jsonwebtoken`) and password hashing with `bcryptjs`.
  - Storage: File-based `JSONDatabase` reading and writing to `server/data/db.json` with `/tmp` caching on Vercel.
  - AI Engine: `@google/genai` (Gemini 2.5/3.8 Flash) with a heuristic QA fallback.
  - Validation: Zod schema validators in `server/src/ai/validator.js`.
- **Existing Frontend API Calls Mapped**:
  1. `POST /api/auth/login` - User authentication
  2. `POST /api/auth/register` - User registration
  3. `GET /api/auth/me` - Profile lookup
  4. `GET /api/projects` - List all projects
  5. `POST /api/projects` - Create project
  6. `DELETE /api/projects/:id` - Delete project
  7. `POST /api/projects/reset-demo` - Seed demo project
  8. `GET /api/dashboard/stats` - Project dashboard metrics & charts
  9. `POST /api/requirements/analyze` - Analyze requirement story
  10. `POST /api/testcases/generate` - Generate structured test cases
  11. `GET /api/testcases` - Paginated repository search & filters
  12. `POST /api/testcases` - Manual test case creation
  13. `PUT /api/testcases/:id` - Update test case
  14. `DELETE /api/testcases/:id` - Delete test case
  15. `POST /api/testcases/:id/duplicate` - Duplicate test case
  16. `POST /api/testcases/bulk-status` - Bulk status updates
  17. `GET /api/regression` - List regression suites
  18. `POST /api/regression/generate` - Impact analysis & regression suite generation
  19. `DELETE /api/regression/:id` - Delete regression suite
  20. `GET /api/api-tests` - List API tests
  21. `POST /api/api-tests/generate` - Synthesize API test scenarios
  22. `DELETE /api/api-tests/:id` - Delete API test
  23. `GET /api/api-tests/export/postman` - Export Postman collection
  24. `POST /api/edge-cases/analyze` - Audit requirement for missing boundary/edge cases
  25. `POST /api/edge-cases/promote` - Promote edge case to permanent test case
  26. `POST /api/test-data/generate` - Synthesize test dataset
  27. `POST /api/bugs/analyze` - Root cause analysis and regression mapping
  28. `GET /api/coverage/matrix` - Traceability matrix & coverage calculation
  29. `GET /api/jira/config` - Fetch Jira connection configuration
  30. `POST /api/jira/config` - Update Jira credentials
  31. `GET /api/jira/issues/search` - Search Jira issues
  32. `POST /api/jira/issues/:issueKey/generate-tests` - Generate test cases from Jira issue
  33. `GET /api/history` - AI generation history
  34. `DELETE /api/history` - Clear history
  35. `GET /api/settings` - System configuration
  36. `POST /api/settings` - Update configuration
  37. `GET /api/settings/audit-logs` - Audit trail
  38. `GET /api/prompts` - Prompt template versions
  39. `PUT /api/prompts/:id` - Update prompt template
  40. `POST /api/export/script` - Generate Playwright/Selenium/Cypress automation scripts
  41. `GET /api/export/testcases` - Export test cases to Excel (.xlsx) / CSV

---

## 2. Identified Deficiencies in Existing Backend
1. **Metric Hardcoding**: Baseline numbers (`+ 12` edge cases, fallback `78%` coverage) existed rather than calculating dynamically from normalized entity counts.
2. **Missing Asynchronous Job System**: Long AI generation operations blocked the HTTP request cycle synchronously without job state tracking (`QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`).
3. **Missing API Execution Engine**: API scenarios were generated as metadata, but users could not execute real HTTP calls, assert responses, or track latency and status codes.
4. **Lack of Strict Multi-Tenant Data Isolation**: Endpoints accepted `projectId` query parameters without validating that the authenticated user belongs to the project.
5. **Missing Role-Based Access Control (RBAC)**: Five distinct roles (`ADMIN`, `QA_LEAD`, `QA_ENGINEER`, `DEVELOPER`, `VIEWER`) and 15+ granular permissions must be enforced at the middleware layer.
6. **Secret Masking & Encryption**: Sensitive tokens (Jira API tokens, LLM API keys) must be encrypted at rest and masked (`**************`) on retrieval.
7. **SSRF Protection**: Outgoing HTTP calls (API test execution, Jira Webhooks) lacked private IP/metadata address filtering.
8. **Traceability & Versioning**: Historical test case edits did not preserve immutable version snapshots (`TestCaseVersion`).

---

## 3. Target Enterprise Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React + Tailwind Client UI                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                    API Gateway / Express                    │
│  - Standardized Response Envelope ({ success, data, error })│
│  - Request ID & Traceability Logging                        │
│  - Rate Limiter & SSRF Filtering                            │
│  - Centralized Error Handler & OpenAPI Documentation        │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│   Auth & RBAC Middleware    │ │  Data Isolation Middleware  │
│  - JWT Bearer Verification  │ │  - Project Membership Guard │
│  - Role / Permission Checks │ │  - Tenant Separation        │
└──────────────┬──────────────┘ └──────────────┬──────────────┘
               │                               │
┌──────────────▼───────────────────────────────▼──────────────┐
│                       Service Layer                         │
│  - AuthService & UserService (RBAC, Tokens, Sessions)       │
│  - ProjectService (Environments, Members, Configs)          │
│  - TestCaseService & VersioningEngine                       │
│  - RequirementService & TraceabilityEngine                  │
│  - RegressionEngine & ImpactAnalyzer                        │
│  - ApiTestingService & HttpExecutionEngine                  │
│  - BugAnalysisService & RootCauseEngine                     │
│  - CoverageService & QAHealthEngine (Transparent Formula)   │
│  - JiraService (OAuth / Token Auth, Issue Sync)             │
│  - ExportService (Excel, CSV, Playwright, Selenium, Robot)  │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│    AI Orchestration Layer   │ │   Background Job System     │
│  - AIProvider Abstraction   │ │  - Job Queue (In-Memory/DB) │
│  - Gemini, OpenAI, Claude   │ │  - Status: QUEUED, RUNNING, │
│  - Centralized Prompt Store │ │    COMPLETED, FAILED        │
│  - Zod Auto-Repair & Retry  │ │  - Progress Polling API     │
└──────────────┬──────────────┘ └──────────────┬──────────────┘
               │                               │
┌──────────────▼───────────────────────────────▼──────────────┐
│              Normalized Enterprise Database                 │
│  - 40+ Entities with Referential Integrity & Indexes        │
│  - Fast Relational Query Engine                             │
│  - Atomic File Persistence & Serverless /tmp Support        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Complete Database Entities Specification

The normalized database schema supports the following entities:

1. **User**: `id`, `name`, `email`, `password_hash`, `role`, `status`, `created_at`, `updated_at`
2. **Role**: `id`, `name`, `description`, `permissions` (JSON array)
3. **Permission**: `id`, `code`, `category`, `description`
4. **Project**: `id`, `name`, `key`, `description`, `owner_id`, `status`, `repository_url`, `frontend_url`, `backend_url`, `modules` (JSON array), `created_at`, `updated_at`
5. **ProjectMember**: `id`, `project_id`, `user_id`, `role`, `joined_at`
6. **Environment**: `id`, `project_id`, `name` (`DEV`, `QA`, `STAGING`, `PRODUCTION`), `base_url`, `variables` (JSON), `is_default`
7. **Requirement**: `id`, `project_id`, `title`, `module`, `raw_text`, `status`, `priority`, `created_by`, `created_at`, `updated_at`
8. **RequirementAnalysis**: `id`, `requirement_id`, `project_id`, `summary`, `functional_requirements` (JSON), `non_functional_requirements` (JSON), `acceptance_criteria` (JSON), `business_rules` (JSON), `dependencies` (JSON), `ambiguities` (JSON), `missing_requirements` (JSON), `risks` (JSON), `ai_job_id`, `created_at`
9. **TestCase**: `id`, `project_id`, `requirement_id`, `test_case_id`, `title`, `module`, `priority`, `test_type`, `status` (`DRAFT`, `REVIEW`, `APPROVED`, `REJECTED`, `ARCHIVED`), `preconditions`, `test_data`, `steps` (JSON), `expected_result`, `tags` (JSON), `automation_candidate`, `current_version`, `created_by`, `created_at`, `updated_at`
10. **TestCaseVersion**: `id`, `test_case_id`, `version_number`, `snapshot` (JSON), `change_summary`, `created_by`, `created_at`
11. **TestSuite**: `id`, `project_id`, `name`, `description`, `test_case_ids` (JSON), `created_at`
12. **TestExecution**: `id`, `project_id`, `suite_id`, `environment_id`, `status` (`QUEUED`, `RUNNING`, `PASSED`, `FAILED`, `CANCELLED`), `started_at`, `completed_at`, `summary` (JSON)
13. **TestExecutionResult**: `id`, `execution_id`, `test_case_id`, `status` (`PASSED`, `FAILED`, `SKIPPED`, `BLOCKED`), `duration_ms`, `error_message`, `stack_trace`, `screenshot_url`
14. **RegressionAnalysis**: `id`, `project_id`, `trigger_type` (`REQUIREMENT_CHANGE`, `BUG_FIX`, `CODE_COMMIT`), `change_description`, `impact_score`, `affected_modules` (JSON), `affected_test_case_ids` (JSON), `high_risk_areas` (JSON), `reasoning`, `ai_job_id`, `created_at`
15. **RegressionTest**: `id`, `project_id`, `suite_name`, `test_case_ids` (JSON), `status`, `created_at`
16. **ApiProject**: `id`, `project_id`, `name`, `base_url`, `auth_type`, `auth_config` (JSON)
17. **ApiCollection**: `id`, `api_project_id`, `name`, `description`
18. **ApiRequest**: `id`, `collection_id`, `name`, `method` (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), `endpoint`, `headers` (JSON), `query_params` (JSON), `body` (JSON), `auth` (JSON)
19. **ApiTestCase**: `id`, `project_id`, `name`, `endpoint`, `method`, `category` (`Positive`, `Negative`, `Boundary`, `Auth`, `Security`), `headers` (JSON), `request_body` (JSON), `expected_status`, `assertions` (JSON), `created_at`
20. **ApiExecution**: `id`, `api_test_case_id`, `status` (`PASSED`, `FAILED`, `ERROR`), `request_dump` (JSON), `response_status`, `response_time_ms`, `response_headers` (JSON), `response_body` (JSON), `assertion_results` (JSON), `executed_at`
21. **EdgeCase**: `id`, `project_id`, `requirement_id`, `title`, `description`, `category`, `severity`, `suggested_steps` (JSON), `expected_outcome`, `is_promoted`, `created_at`
22. **Bug**: `id`, `project_id`, `bug_id`, `title`, `module`, `severity`, `priority`, `status`, `description`, `steps_to_reproduce`, `expected_result`, `actual_result`, `logs`, `created_at`
23. **BugAnalysis**: `id`, `bug_id`, `probable_root_cause`, `confidence` (`HIGH`, `MEDIUM`, `LOW`), `affected_module`, `impacted_requirement_ids` (JSON), `suggested_regression_test_ids` (JSON), `missing_tests` (JSON), `reproduction_advisory`, `ai_job_id`, `created_at`
24. **TestDataSet**: `id`, `project_id`, `name`, `description`, `format` (`JSON`, `CSV`), `fields` (JSON), `record_count`, `records` (JSON), `status` (`DRAFT`, `READY`, `ARCHIVED`), `created_at`
25. **CoverageReport**: `id`, `project_id`, `calculated_at`, `requirement_coverage_pct`, `test_case_count`, `approved_test_case_count`, `automation_coverage_pct`, `api_coverage_pct`, `qa_health_score`, `module_breakdown` (JSON)
26. **AiGenerationJob**: `id`, `project_id`, `user_id`, `operation` (`TESTCASE_GENERATION`, `REQUIREMENT_ANALYSIS`, `REGRESSION_ANALYSIS`, `API_TEST_GENERATION`, `EDGE_CASE_ANALYSIS`, `BUG_ANALYSIS`, `TEST_DATA_GENERATION`), `status` (`QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`), `progress`, `input_payload` (JSON), `result` (JSON), `error` (JSON), `created_at`, `updated_at`
27. **AiPrompt**: `id`, `name`, `version`, `system_prompt`, `user_prompt_template`, `output_schema` (JSON), `model`, `temperature`, `max_tokens`, `is_active`, `updated_at`
28. **AiUsage**: `id`, `job_id`, `project_id`, `user_id`, `provider`, `model`, `input_tokens`, `output_tokens`, `duration_ms`, `estimated_cost_usd`, `created_at`
29. **ActivityLog**: `id`, `project_id`, `user_id`, `activity_type`, `description`, `metadata` (JSON), `created_at`
30. **AuditLog**: `id`, `user_id`, `action`, `resource`, `resource_id`, `ip_address`, `details` (JSON), `created_at`
31. **JiraConnection**: `id`, `project_id`, `jira_url`, `username`, `encrypted_api_token`, `status`, `last_sync_at`
32. **JiraIssue**: `id`, `project_id`, `jira_key`, `summary`, `description`, `issue_type`, `status`, `priority`, `external_updated_at`
33. **Secret**: `id`, `project_id`, `key_name`, `encrypted_value`, `masked_preview`, `created_at`, `updated_at`
34. **Notification**: `id`, `user_id`, `title`, `message`, `type`, `read`, `created_at`

---

## 5. Security & SSRF Protection Architecture
- **Secret Encryption**: AES-256-GCM encryption with SHA-256 derived keys from `JWT_SECRET` / `AUTH_SECRET`.
- **Secret Masking**: Secret values never transmitted back to clients; formatted as `************XXXX` where XXXX is the last 4 characters.
- **SSRF Protection Engine**: Validates target URLs for API Execution and Jira:
  - Disallows loopback (`127.0.0.1`, `localhost`), link-local (`169.254.0.0/16`), private class A/B/C (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
  - Restricts allowed protocols to `http:` and `https:`.
- **RBAC Authorization Matrix**:

| Permission Code | Admin | QA Lead | QA Engineer | Developer | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|
| `PROJECT_VIEW` | Yes | Yes | Yes | Yes | Yes |
| `PROJECT_CREATE` | Yes | Yes | No | No | No |
| `REQUIREMENT_ANALYZE` | Yes | Yes | Yes | Yes | No |
| `TESTCASE_CREATE` | Yes | Yes | Yes | Yes | No |
| `TESTCASE_APPROVE` | Yes | Yes | No | No | No |
| `TESTCASE_DELETE` | Yes | Yes | No | No | No |
| `API_TEST_EXECUTE` | Yes | Yes | Yes | Yes | No |
| `BUG_ANALYZE` | Yes | Yes | Yes | Yes | No |
| `REGRESSION_ANALYZE` | Yes | Yes | Yes | No | No |
| `JIRA_CONNECT` | Yes | Yes | No | No | No |
| `USER_MANAGE` | Yes | No | No | No | No |
| `AUDIT_VIEW` | Yes | Yes | No | No | No |

---

## 6. Implementation Phases

- **Phase 1**: Database entities, relational index engine, migration runner, seed dataset.
- **Phase 2**: Authentication, RBAC permission middleware, project membership isolation.
- **Phase 3**: Dynamic Dashboard aggregation APIs, transparent QA Health Engine (0 hardcoded values).
- **Phase 4**: Asynchronous AI Job System (`AiGenerationJob`) with polling & cancel APIs.
- **Phase 5**: Multi-provider AI Layer (`GeminiProvider`, `OpenAIProvider`, `AnthropicProvider`, `HeuristicQAEngine`) with centralized `AiPrompt` templates.
- **Phase 6**: Requirements Analyzer, Test Case Generator & Test Case Versioning Repository (`TestCaseVersion`).
- **Phase 7**: Regression Impact Analyzer, Edge Case Analyzer, Bug Analyzer, and Test Data Generator.
- **Phase 8**: Real HTTP API Execution Engine with assertion engine and SSRF protection.
- **Phase 9**: Jira Integration with encrypted credentials and sync tracking.
- **Phase 10**: OpenAPI 3.0 Documentation (`/api/docs`), Security & Audit Loggers, Unit/Integration Test Suites.
- **Phase 11**: Frontend Integration verification and comprehensive `BACKEND_AUDIT_REPORT.md`.

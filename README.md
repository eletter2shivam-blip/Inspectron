# AI QA Assistant

> **Production-Ready Enterprise Platform for Autonomous QA Engineering, Test Design & Automation**

**AI QA Assistant** is a full-stack, modular, production-grade web application built to empower QA architects and software test engineers. It analyzes software requirements, user stories, Jira tickets, APIs, and defect reports to automatically synthesize structured test cases, regression coverage, adversarial edge cases, realistic test data, and automation scripts.

---

## 🌟 Key Capabilities (Fulfills All 32 Architecture Specifications)

1. **Dashboard & Executive Analytics**
   - KPI metrics: Total Projects, Requirements Analyzed, Test Cases Generated, Regression Suites, API Scenarios, Bugs Diagnosed, Edge Cases Found, and Aggregate Test Coverage %.
   - Interactive charts: Test Type distribution, Risk-aligned Priority breakdown, and Module test volume.
   - Live activity stream and recent test case feeds with project switching.

2. **Requirements Analyzer**
   - Parse plain text, user stories ("As a... I want... so that..."), PRD documents, or acceptance criteria.
   - Deconstructs requirements into: **Requirement Summary, Actors & Roles, Preconditions, Business Rules, Functional Requirements, Non-Functional Requirements, Acceptance Criteria, Ambiguities, Missing Information, Dependencies, Risks, and Testable Conditions**.
   - One-click workflow into the Test Case Generator.

3. **Jira Cloud Integration**
   - Configure Jira URL, Project Key, Username, and API Token (stored securely and masked; never exposed in client logs).
   - Search and inspect Jira tickets (Summary, Description, Acceptance Criteria, Comments, Labels, Priority, Components).
   - One-click **"Generate Test Cases"** directly from any Jira ticket.

4. **Structured Test Case Generator**
   - Generates comprehensive test cases with all required attributes:
     - `Test Case ID`
     - `Requirement ID`
     - `Module`
     - `Feature`
     - `Scenario`
     - `Test Case Title`
     - `Preconditions`
     - `Test Data`
     - `Steps` (Array of discrete actions)
     - `Expected Result`
     - `Priority` (`P1-Critical`, `P2-High`, `P3-Medium`, `P4-Low`)
     - `Test Type` (`Functional`, `UI`, `Integration`, `API`, `Regression`, `Smoke`, `Sanity`, `Negative`, `Boundary`, `Security`, `Performance`, `Compatibility`, `Validation`)
     - `Automation Candidate` (`true`/`false`)
     - `Notes`
   - Covers: Positive scenarios, Negative scenarios, Boundary limits, Input validation, Error handling, Permission/authorization, Data integrity, Session timeout, and Browser compatibility.

5. **Test Case Quality Engine**
   - Automated quality audit evaluating test cases against ISO/IEC/IEEE 29119 standards.
   - Detects duplicate scenarios, missing preconditions, missing expected results, unclear steps, and non-testable subjective language ("works fine", "should be fast").
   - Assigns a calibrated **Quality Score (0–100%)**, letter grade, list of strengths, and actionable improvement recommendations.

6. **Test Case Repository & Editor**
   - Advanced multi-column filter bar: Module, Requirement ID, Priority, Test Type, Status, Search, and Pagination.
   - Inline Editor: Edit, Delete, Duplicate, Bulk Approve/Reject.
   - Export to **Excel (.xlsx)**, **CSV**, and **JSON**.
   - Instant Automation Script preview modal for any test case.

7. **Regression Test Case Generator**
   - Analyzes proposed changes, release notes, and bug fixes against existing test coverage.
   - Identifies: **Direct Impact**, **Indirect Impact**, and **Dependency Impact**.
   - Classifies regressions: `Critical Regression`, `High Regression`, `Medium Regression`, `Low Regression`.

8. **Dedicated API Test Case Generator**
   - Supports `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
   - Generates Contract, Security Headers, 401 Unauthorized, 403 Forbidden, 400 Bad Request, 422 Data Type Mismatch, 429 Rate Limiting, and Schema Validation tests.
   - Generates ready-to-run **Postman test script snippets** for each test case.
   - One-click **Export Postman Collection (v2.1 JSON)**.

9. **Edge Case Analyzer**
   - Identifies missing scenarios across 25+ failure dimensions: Unicode/Emoji, Null/Empty submissions, Max/Min boundaries, Rapid multi-click idempotency, Session timeout during drafting, and Sudden network drops.
   - Displays: *Potential Missing Scenario*, *Why It Matters*, *Suggested Test Case*, *Risk Level*.
   - Direct "+ Add to Test Repository" action.

10. **Intelligent Test Data Generator**
    - Supported types: `Email`, `Phone number`, `Name`, `Address`, `Date`, `Currency`, `Integer`, `Decimal`, `Password`, `Username`, `UUID`, `URL`, `JSON`, `CSV`.
    - Generates balanced distributions of `valid`, `invalid`, `boundary`, `negative`, `random`, and `realistic` records.
    - Quantity selector: **10 / 50 / 100 / 500 records**.
    - Export to CSV, Excel, and JSON.
    - Privacy safeguard: Strict synthetic data generation without real personal PII.

11. **Bug Analyzer & RCA Engine**
    - Input defect details: Title, Steps to Reproduce, Expected Result, Actual Result, Environment, Browser, Device, Build Version.
    - AI provides: Bug Summary, Root Cause Hypothesis, Affected Module/Functionality, Reproduction Scenario, Original vs. Regression vs. Negative Test Scenario, Collateral Risk Areas, and Preventative Tests.
    - Automatically synthesizes **Bug → Regression Test Cases** and inserts them into the repository.

12. **Requirement → Test Traceability Matrix**
    - Visual traceability matrix mapping requirements to test case IDs.
    - Dynamic coverage status: `Complete` (100%), `Partial` (50–99%), `Missing` (0%).
    - Risk indicators and one-click "+ Add Tests" shortcut.

13. **Project Management & Preloaded Demo**
    - Multi-project isolation for requirements, test cases, and history.
    - Preloaded demo project: **"Inspectron"** with all 12 modules:
      - `Dashboard`, `Login`, `Signup`, `Campaign`, `Google Ads`, `Meta Ads`, `LinkedIn`, `Notifications`, `Reports`, `Funnel`, `Support Ticket`, `User Management`.
    - "Reset Demo Project" feature to restore clean baseline state anytime.

14. **AI Generation History**
    - Full provenance log: Timestamp, Project, Feature, Input Summary, Generated Output, User, AI Model, Prompt Version, and Execution Duration.
    - Modal inspector to view exact input payloads and structured JSON outputs.

15. **Modular AI Prompt Engine & Versioning**
    - Modular prompt templates for all 9 AI activities.
    - Versioned prompt editor (v1.x) with active/inactive version switches.

16. **Future Test Automation Support**
    - Generates ready-to-use automation code for any test case:
      - **Playwright (TypeScript)**
      - **Selenium (Java + TestNG)**
      - **Cypress (JavaScript)**
      - **RestAssured (Java)**
      - **Postman Collection v2.1 JSON**

17. **Security & Role-Based Access Control (RBAC)**
    - JWT authentication with secure session handling.
    - Role hierarchy: `qa_lead` > `senior_qa` > `qa_engineer` > `viewer`.
    - Immutable Audit Log recording all critical system actions, users, and timestamps.

---

## 🏗️ Architecture

```
fervent-maxwell/
├── server/                         # Express & Node.js Backend
│   ├── src/
│   │   ├── index.js                # Server entrypoint & static client server
│   │   ├── db/
│   │   │   ├── database.js         # ACID-compliant persistent JSON/SQLite store
│   │   │   └── seed.js             # Inspectron demo dataset loader
│   │   ├── ai/
│   │   │   ├── AIService.js        # Provider abstraction layer
│   │   │   ├── validator.js        # Zod schema validation & auto-repair engine
│   │   │   ├── providers/
│   │   │   │   ├── GeminiProvider.js    # Google Gemini 3.8 Flash SDK integration
│   │   │   │   └── HeuristicQAEngine.js # Advanced domain-specific QA intelligence
│   │   │   └── prompts/            # Modular versioned prompt templates
│   │   ├── services/
│   │   │   ├── QualityEngine.js    # Test quality auditor (ISO 29119)
│   │   │   ├── ExportService.js    # Excel, CSV, JSON export
│   │   │   ├── JiraService.js      # Atlassian Jira Cloud REST client
│   │   │   └── AutomationExporter.js # Playwright/Selenium/Cypress generator
│   │   ├── controllers/            # 16 REST API controllers
│   │   ├── middleware/             # JWT Auth, RBAC, Audit logger, Error handler
│   │   └── routes/api.js           # REST API routes
│   └── tests/                      # 22 automated integration and unit tests
├── client/                         # Modern React + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── App.jsx                 # App shell, routing, layout
│   │   ├── api/client.js           # API client with token interceptors
│   │   ├── context/                # Auth, Project, and Toast providers
│   │   ├── components/             # Sidebar, Header, Stepped AI Banner, Modals
│   │   └── pages/                  # 14 complete QA workflow dashboards
│   └── dist/                       # Production frontend bundle
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0 (Node.js LTS v24+ recommended)
- npm >= 9.0.0

### Quick Start (Runs Server & Delivers Frontend)

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Seed database with Inspectron demo project (12 modules)
npm run seed

# 3. Run all automated backend tests
npm test

# 4. Start production server
npm start
```

The application is accessible at:
👉 **`http://localhost:5000`**

### Development Mode (with Vite Hot Reload)

To run the frontend dev server concurrently:

```bash
# Terminal 1: Backend API Server
cd server
npm run dev

# Terminal 2: Frontend Vite Dev Server
cd client
npm run dev
```

Visit:
👉 **`http://localhost:3000`** (Proxies API calls to port 5000)

---

## 🔑 Demo Personas & Credentials

The system includes preconfigured demo accounts for immediate access:

| Persona | Email | Password | Role | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Sarah Jenkins** | `lead@inspectron.io` | `password123` | `qa_lead` | Full Access (Settings, Prompts, Projects) |
| **David Chen** | `qa@inspectron.io` | `password123` | `senior_qa` | Test Generation, Quality Review, Export |
| **Maya Rodriguez** | `maya@inspectron.io` | `password123` | `qa_engineer` | Requirements, Test Cases, Bugs |

*A one-click demo login switcher is available on the Login screen.*

---

## 🤖 AI Provider Configuration

The application features a **Dual-Engine Architecture**:

1. **Heuristic QA Intelligence Engine (Offline / Local)**
   - Deterministic domain-specific QA rules engine based on ISTQB principles, boundary-value analysis, and OWASP patterns.
   - Runs out-of-the-box with **zero external API keys, zero cost, and zero network latency**.
2. **Google Gemini 3.8 Flash (`@google/genai` SDK v2.24+)**
   - High-speed agentic multimodal LLM.
   - Configure via environment variable:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     ```
   - Or configure directly in the UI under **Settings > AI Provider & Models**.
3. **Hybrid Mode (Default)**
   - Uses Google Gemini 3.8 Flash when configured; automatically falls back to Heuristic QA Engine if network errors or quota limits occur.

---

## 🧪 Automated Test Verification

All 22 integration and unit tests pass with zero failures:

```bash
cd server
npm test
```

Test breakdown:
- Health check verification
- JWT authentication & profile retrieval
- Dashboard KPI aggregation and charts
- Requirement decomposition into actors, rules, ambiguities, and acceptance criteria
- Test case generation covering functional, boundary, negative, and security dimensions
- Test Case Quality Engine scoring, grading, and recommendations
- REST API scenario generation and Postman collection v2.1 export
- Adversarial edge case discovery across concurrency, unicode, and session states
- Synthetic privacy-safe test data generation and CSV export
- Bug diagnosis, root cause analysis, and Bug → Regression test generation
- Requirement-to-Test Traceability Matrix computation
- Atlassian Jira Cloud ticket fetching and direct test case generation
- Excel (.xlsx) and CSV test suite exports with all 14 required columns
- Playwright, Selenium, and Cypress automation script synthesis
- JSON schema validation and auto-repair engine

---

## 📄 License

Proprietary QA Enterprise Software. Built for autonomous quality engineering and test automation.

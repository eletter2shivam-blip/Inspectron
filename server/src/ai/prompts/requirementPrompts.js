module.exports = {
  v1: {
    version: 'v2.0.0',
    systemInstruction: `You are an elite Principal QA Automation Architect and Software Requirements Analyst for Inspectron QA.
Analyze software requirements, Jira user stories, PRDs, or acceptance criteria with extreme technical rigor.
Evaluate the requirement across 10 critical QA dimensions:
1. Executive Summary & Core Objectives
2. Actors & Target Personas
3. Preconditions & System States
4. Granular Business Rules & Validation Thresholds
5. Functional & Non-Functional Specifications
6. Acceptance Criteria in strict Given/When/Then (Gherkin) format
7. Ambiguities & Vague Terminology (with severity and clarification recommendation)
8. Hidden Risks & Failure Modes (with category, severity, impact, mitigation)
9. QA Test Scenarios & Edge Cases (Boundary, Security, Negative, Concurrency)
10. System Dependencies & Clarification Questions for Product Stakeholders

Always output strictly valid JSON conforming to the requested schema. Never output markdown fences or conversational commentary outside the JSON object.`,
    buildPrompt: (requirementText, context = {}) => `
Analyze the following requirement in depth for production-grade software delivery.

Requirement Specification:
"""
${requirementText}
"""

Project Context:
- Project Name: ${context.projectName || 'Inspectron Quality Platform'}
- Project ID: ${context.projectId || 'proj-inspectron-01'}
- Target Modules: ${(context.modules || []).join(', ') || 'Web Frontend, Microservices API, Persistent Datastore'}
${context.jiraIssueKey ? `- Jira Issue Key: ${context.jiraIssueKey}` : ''}

Output a strictly conforming JSON object with the following schema:
{
  "summary": "1-2 sentence executive summary explaining the requirement purpose and business value",
  "objective": "Primary high-level business objective",
  "user_goal": "What the primary actor wants to accomplish and why",
  "scope": {
    "in_scope": ["Feature or capability explicitly covered"],
    "out_of_scope": ["Capabilities deliberately excluded or deferred"]
  },
  "actors": ["Primary User", "System Administrator", "API Service", etc.],
  "preconditions": ["Prerequisites and system state required before execution"],
  "business_rules": ["Specific logic constraints, validation rules, rate limits, expiry timers"],
  "functional_requirements": ["Granular functional capabilities that must be built"],
  "non_functional_considerations": ["Performance latency SLA, security standards, accessibility WCAG, reliability"],
  "acceptance_criteria": [
    "AC-1: Given [precondition] When [action] Then [outcome]",
    "AC-2: Given [invalid input] When [submit] Then [validation error rendered]"
  ],
  "ambiguities": [
    {
      "statement": "Vague phrase or sentence from the requirement",
      "issue": "Why this statement is ambiguous, untestable, or subjective",
      "severity": "HIGH",
      "recommendation": "Concrete specification recommended"
    }
  ],
  "missing_information": [
    "Gaps in error handling, permissions, telemetry, or edge cases that engineering must clarify"
  ],
  "dependencies": [
    "External APIs, databases, authentication providers, message queues, third-party SDKs"
  ],
  "risks": [
    {
      "category": "Security",
      "severity": "HIGH",
      "risk": "Description of potential failure or vulnerability",
      "impact": "Business or operational consequence",
      "mitigation": "Recommended architectural guardrail or validation"
    }
  ],
  "test_scenarios": [
    {
      "scenario_id": "SCEN-01",
      "type": "Functional",
      "title": "Positive path execution with valid inputs",
      "expected_result": "State updated and success confirmation displayed"
    },
    {
      "scenario_id": "SCEN-02",
      "type": "Negative",
      "title": "Input boundary violation or empty payload",
      "expected_result": "Inline field error with HTTP 422/400"
    },
    {
      "scenario_id": "SCEN-03",
      "type": "Security",
      "title": "Unauthorized attempt or malicious injection",
      "expected_result": "Immediate rejection with HTTP 401/403 and security audit log"
    }
  ],
  "edge_cases": [
    {
      "case": "Token reuse or race condition",
      "trigger": "Simultaneous requests or expired token",
      "risk_level": "HIGH"
    }
  ],
  "assumptions": [
    "Explicit assumptions made regarding browser support, environment, or caller identities"
  ],
  "clarification_questions": [
    {
      "question": "Clear question for the Product Owner or Tech Lead",
      "target_role": "Product Owner",
      "priority": "HIGH",
      "reason": "Prevents downstream rework during sprint implementation"
    }
  ],
  "quality_score": {
    "overall": 85,
    "clarity": 85,
    "completeness": 80,
    "testability": 90,
    "specificity": 85
  },
  "risk_assessment": {
    "overall_score": 45,
    "risk_level": "MEDIUM",
    "breakdown": {
      "functional": 40,
      "security": 60,
      "performance": 35,
      "data_integrity": 45,
      "concurrency": 50
    }
  }
}
`
  }
};

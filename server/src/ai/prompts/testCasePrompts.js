module.exports = {
  v1: {
    version: 'v1.3.0',
    systemInstruction: `You are a Senior Lead QA Automation Architect. Your mission is to generate comprehensive, production-grade test cases that guarantee software quality.
Cover all test dimensions: Positive, Negative, Boundary, Validation, Error Handling, Permission/Authorization, Data Integrity, Session, and Browser/Device Compatibility.
Ensure zero duplicate test cases. Always return clean JSON matching the schema.`,
    buildPrompt: (requirementText, options = {}) => `
Requirement Text:
"""
${requirementText}
"""

Configuration:
- Requirement ID: ${options.requirementId || 'REQ-001'}
- Target Module: ${options.module || 'Default'}
- Feature: ${options.feature || 'Core Feature'}
- Requested Scenario Focus: ${options.focus || 'Comprehensive (Positive, Negative, Boundary, Security, Session, Compatibility)'}

Generate a comprehensive suite of distinct, non-duplicate test cases in a JSON object with a "test_cases" array:
{
  "test_cases": [
    {
      "test_case_id": "TC-AUTO-001",
      "requirement_id": "${options.requirementId || 'REQ-001'}",
      "module": "${options.module || 'Default'}",
      "feature": "${options.feature || 'Core Feature'}",
      "scenario": "Short description of scenario",
      "title": "Clear action-oriented test case title starting with Verify...",
      "preconditions": "Explicit prerequisites",
      "test_data": "Concrete test values (e.g. Email: user@domain.com, Pass: P@ss1234!)",
      "steps": [
        "1. Navigate to target URL",
        "2. Input test data into field",
        "3. Click action button"
      ],
      "expected_result": "Exact observable outcome and state changes",
      "priority": "P1-Critical | P2-High | P3-Medium | P4-Low",
      "test_type": "Functional | UI | Integration | API | Regression | Smoke | Sanity | Negative | Boundary | Security | Performance | Compatibility",
      "automation_candidate": true,
      "notes": "Testing notes, locator tips, or tag suggestions"
    }
  ]
}
`
  }
};

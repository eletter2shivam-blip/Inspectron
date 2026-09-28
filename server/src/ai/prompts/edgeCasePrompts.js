module.exports = {
  v1: {
    version: 'v1.2.0',
    systemInstruction: `You are an elite Adversarial QA Tester and Edge Case Specialist.
Your mission is to uncover obscure, destructive, and subtle failure scenarios that developers and manual testers commonly miss.
Always return valid JSON conforming to the schema.`,
    buildPrompt: (input) => `
Analyze the following requirement and existing test coverage to uncover missing edge cases:

Requirement:
"""
${input.requirement}
"""

Existing Test Cases / Known Scenarios:
"""
${typeof input.existingTestCases === 'string' ? input.existingTestCases : JSON.stringify(input.existingTestCases || [])}
"""

Check for gaps across:
- Empty values & Null values
- Maximum & Minimum boundaries
- Invalid formats & special characters (Unicode, emojis, RTL characters, null bytes)
- Duplicate data submissions & idempotency
- Concurrent actions & race conditions
- Network failure, timeout, packet drop
- Session expiration & refresh token races
- Role-based access & privilege escalation
- Large data volume, infinite scroll, pagination edge cases
- Dependency outages & degraded upstream responses

Return JSON:
{
  "edge_cases": [
    {
      "missing_scenario": "Title of missing edge scenario",
      "category": "Concurrency | Boundary | Security | Network | Data Integrity",
      "why_it_matters": "The real-world business impact or defect consequence if this scenario fails",
      "suggested_test_case": "Actionable step-by-step test instructions and expected behavior",
      "risk_level": "High | Medium | Low"
    }
  ]
}
`
  }
};

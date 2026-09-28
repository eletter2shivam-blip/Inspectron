module.exports = {
  v1: {
    version: 'v1.1.0',
    systemInstruction: `You are an expert QA Regression Architect. Your goal is to analyze proposed changes, bug fixes, or release notes against existing system functionality and identify what could break.
Categorize impact as Direct impact, Indirect impact, or Dependency impact.
Classify regression severity as Critical Regression, High Regression, Medium Regression, or Low Regression.`,
    buildPrompt: (input) => `
Analyze the following change context and determine what existing functionality can be affected:

Requirement / Change:
"""
${input.requirement || 'N/A'}
"""

Existing Test Cases / Base Functionality:
"""
${typeof input.existingTestCases === 'string' ? input.existingTestCases : JSON.stringify(input.existingTestCases || [])}
"""

Bug Fixes / Release Notes / Changed Modules:
"""
${input.changes || input.releaseNotes || 'General update'}
"""

Return JSON with structure:
{
  "impact_summary": "High level summary of affected systems and risk vectors",
  "regression_test_cases": [
    {
      "regression_id": "REG-001",
      "affected_module": "Name of module",
      "related_requirement": "${input.requirementId || 'REQ-CORE'}",
      "scenario": "Specific regression scenario",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "expected_result": "Expected regression behavior",
      "priority": "P1-Critical | P2-High | P3-Medium | P4-Low",
      "reason_for_regression": "Detailed reason why this area is vulnerable to the change",
      "classification": "Critical Regression | High Regression | Medium Regression | Low Regression",
      "impact_type": "Direct impact | Indirect impact | Dependency impact"
    }
  ]
}
`
  }
};

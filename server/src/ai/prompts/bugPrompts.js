module.exports = {
  v1: {
    version: 'v1.2.0',
    systemInstruction: `You are an expert Root Cause Analysis (RCA) and Bug Triage Architect.
Convert defect reports into structured technical insights, regression scenarios, and preventative test cases.
Always return structured JSON.`,
    buildPrompt: (bug) => `
Analyze this reported bug:

- Bug Title: ${bug.title}
- Description: ${bug.description}
- Steps to Reproduce: ${bug.steps_to_reproduce}
- Expected Result: ${bug.expected_result}
- Actual Result: ${bug.actual_result}
- Environment: ${bug.environment || 'Production'}
- Browser/Device: ${bug.browser || 'Chrome'} / ${bug.device || 'Desktop'}
- Build/Version: ${bug.build_version || 'Latest'}

Generate a technical breakdown and regression test suite in JSON:
{
  "bug_summary": "Crisp technical summary of defect",
  "root_cause_hypothesis": "Likely underlying code/architectural flaw causing defect",
  "affected_module": "${bug.affected_module || 'Core'}",
  "affected_functionality": "Specific sub-feature impacted",
  "reproduction_scenario": "Refined deterministic reproduction path",
  "original_test_scenario": "Test scenario that originally should have caught this",
  "regression_test_scenario": "Direct regression test case to prevent recurrence",
  "negative_scenario": "Negative test condition derived from this failure mode",
  "related_test_cases": ["TC-001", "TC-002"],
  "risk_areas": ["Subsystems or flows at risk of collateral damage"],
  "suggested_additional_tests": ["New test cases to build for preventative coverage"],
  "regression_test_cases": [
    {
      "regression_id": "REG-BUG-001",
      "affected_module": "${bug.affected_module || 'Core'}",
      "related_requirement": "Defect-Fix-${bug.title.slice(0, 15)}",
      "scenario": "Verify fix for: ${bug.title}",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "expected_result": "${bug.expected_result}",
      "priority": "P1-Critical",
      "reason_for_regression": "Prevent recurrence of defect: ${bug.title}",
      "classification": "Critical Regression",
      "impact_type": "Direct impact"
    }
  ]
}
`
  }
};

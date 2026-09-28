module.exports = {
  v1: {
    version: 'v1.2.0',
    systemInstruction: `You are an elite Principal QA Automation Architect and Software Requirements Analyst.
Analyze software requirements, Jira stories, or acceptance criteria with rigor.
Always output valid JSON conforming exactly to the requested schema. Never output conversational prose outside the JSON.`,
    buildPrompt: (requirementText, context = {}) => `
Analyze the following requirement in depth.

Requirement:
"""
${requirementText}
"""

Project Context:
- Project: ${context.projectName || 'General Application'}
- Modules: ${(context.modules || []).join(', ') || 'Standard Web & API'}

Return a JSON object with this exact structure:
{
  "summary": "Concise 1-2 sentence executive summary of requirement purpose",
  "actors": ["Primary User", "System Service", "Admin", etc.],
  "preconditions": ["System states or user prerequisites required before execution"],
  "business_rules": ["Core business logic, constraints, thresholds, rate limits"],
  "functional_requirements": ["Granular functional capabilities that must be built"],
  "non_functional_considerations": ["Performance latency, security, scalability, accessibility"],
  "acceptance_criteria": ["Clear testable Gherkin or AC statements (AC-1, AC-2...)"],
  "ambiguities": ["Unclear terminology, vague assumptions, unspecified behaviors"],
  "missing_information": ["Gaps that engineering or QA must clarify before sign-off"],
  "dependencies": ["Upstream/downstream services, external APIs, databases, queues"],
  "risks": ["Failure modes, security vulnerabilities, business risks"],
  "testable_conditions": ["Specific boundary, concurrency, error, or data conditions to test"]
}
`
  }
};

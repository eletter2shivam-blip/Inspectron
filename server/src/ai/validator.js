const { z } = require('zod');

// Schema definitions for AI outputs

const RequirementAnalysisSchema = z.object({
  summary: z.string().default(''),
  actors: z.array(z.string()).default([]),
  preconditions: z.array(z.string()).default([]),
  business_rules: z.array(z.string()).default([]),
  functional_requirements: z.array(z.string()).default([]),
  non_functional_considerations: z.array(z.string()).default([]),
  acceptance_criteria: z.array(z.string()).default([]),
  ambiguities: z.array(z.string()).default([]),
  missing_information: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  testable_conditions: z.array(z.string()).default([])
});

const TestCaseItemSchema = z.object({
  test_case_id: z.string().optional(),
  requirement_id: z.string().optional(),
  module: z.string().default('General'),
  feature: z.string().default('General'),
  scenario: z.string(),
  title: z.string(),
  preconditions: z.string().default(''),
  test_data: z.string().default(''),
  steps: z.union([z.array(z.string()), z.string()]).transform(val => {
    if (Array.isArray(val)) return val;
    return val.split('\n').filter(s => s.trim().length > 0);
  }),
  expected_result: z.string(),
  priority: z.enum(['P1-Critical', 'P2-High', 'P3-Medium', 'P4-Low']).catch('P2-High'),
  test_type: z.enum([
    'Functional', 'UI', 'Integration', 'API', 'Regression',
    'Smoke', 'Sanity', 'Negative', 'Boundary', 'Security',
    'Performance', 'Compatibility', 'Validation'
  ]).catch('Functional'),
  automation_candidate: z.boolean().default(true),
  notes: z.string().default('')
});

const TestCaseGenerationSchema = z.object({
  test_cases: z.array(TestCaseItemSchema)
});

const RegressionTestItemSchema = z.object({
  regression_id: z.string().optional(),
  affected_module: z.string(),
  related_requirement: z.string().default(''),
  scenario: z.string(),
  steps: z.union([z.array(z.string()), z.string()]).transform(val => {
    if (Array.isArray(val)) return val;
    return val.split('\n').filter(s => s.trim().length > 0);
  }),
  expected_result: z.string(),
  priority: z.string().default('P2-High'),
  reason_for_regression: z.string(),
  classification: z.enum(['Critical Regression', 'High Regression', 'Medium Regression', 'Low Regression']).catch('High Regression'),
  impact_type: z.enum(['Direct impact', 'Indirect impact', 'Dependency impact']).catch('Direct impact')
});

const RegressionGenerationSchema = z.object({
  impact_summary: z.string().optional(),
  regression_test_cases: z.array(RegressionTestItemSchema)
});

const ApiTestItemSchema = z.object({
  api_test_id: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  endpoint: z.string(),
  headers: z.record(z.any()).default({}),
  query_params: z.record(z.any()).optional().default({}),
  path_params: z.record(z.any()).optional().default({}),
  request_body: z.any().optional(),
  test_data: z.string().default(''),
  expected_status_code: z.number(),
  expected_response: z.any(),
  validation: z.string(),
  priority: z.string().default('P2-High'),
  postman_script: z.string().optional().default('')
});

const ApiTestGenerationSchema = z.object({
  api_tests: z.array(ApiTestItemSchema)
});

const EdgeCaseItemSchema = z.object({
  missing_scenario: z.string(),
  why_it_matters: z.string(),
  suggested_test_case: z.string(),
  risk_level: z.enum(['High', 'Medium', 'Low']).catch('Medium'),
  category: z.string().optional()
});

const EdgeCaseDetectionSchema = z.object({
  edge_cases: z.array(EdgeCaseItemSchema)
});

const BugAnalysisSchema = z.object({
  bug_summary: z.string(),
  root_cause_hypothesis: z.string(),
  affected_module: z.string(),
  affected_functionality: z.string(),
  reproduction_scenario: z.string(),
  original_test_scenario: z.string(),
  regression_test_scenario: z.string(),
  negative_scenario: z.string(),
  related_test_cases: z.array(z.string()).default([]),
  risk_areas: z.array(z.string()).default([]),
  suggested_additional_tests: z.array(z.string()).default([]),
  regression_test_cases: z.array(RegressionTestItemSchema).default([])
});

const TestDataRecordSchema = z.object({
  id: z.number().optional(),
  type: z.string(),
  value: z.any(),
  note: z.string().optional()
});

const TestDataGenerationSchema = z.object({
  field_name: z.string(),
  data_type: z.string(),
  records: z.array(TestDataRecordSchema)
});

const QualityReviewSchema = z.object({
  quality_score: z.number().min(0).max(100),
  grade: z.string().default('B+'),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
  duplicate_count: z.number().default(0),
  missing_preconditions_count: z.number().default(0),
  missing_expected_results_count: z.number().default(0)
});

/**
 * Robust JSON extraction & auto-repair function
 */
function cleanAndRepairJson(rawText) {
  if (typeof rawText !== 'string') {
    return rawText;
  }

  let text = rawText.trim();

  // Strip markdown code fences if present (```json ... ``` or ``` ...)
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Attempt direct parse first
  try {
    return JSON.parse(text);
  } catch (initialErr) {
    try {
      // 1. Remove trailing commas before closing braces/brackets
      let repaired = text.replace(/,(\s*[}\]])/gm, '$1');

      return JSON.parse(repaired);
    } catch (secondErr) {
      // 2. Fallback: extract the largest bracketed or braced substring
      const jsonStartBrace = text.indexOf('{');
      const jsonStartBracket = text.indexOf('[');
      let startIdx = -1;
      let isArray = false;

      if (jsonStartBrace !== -1 && (jsonStartBracket === -1 || jsonStartBrace < jsonStartBracket)) {
        startIdx = jsonStartBrace;
      } else if (jsonStartBracket !== -1) {
        startIdx = jsonStartBracket;
        isArray = true;
      }

      if (startIdx !== -1) {
        const endChar = isArray ? ']' : '}';
        const endIdx = text.lastIndexOf(endChar);
        if (endIdx > startIdx) {
          const substring = text.substring(startIdx, endIdx + 1).replace(/,(\s*[}\]])/gm, '$1');
          try {
            return JSON.parse(substring);
          } catch (thirdErr) {
            console.warn('Auto-repair could not parse JSON substring:', thirdErr.message);
          }
        }
      }
      throw new Error(`Failed to parse AI JSON response: ${initialErr.message}`);
    }
  }
}

/**
 * Validate and repair AI output with Zod schema
 */
function validateAIOutput(schema, rawData) {
  const parsedData = typeof rawData === 'string' ? cleanAndRepairJson(rawData) : rawData;
  const result = schema.safeParse(parsedData);
  if (!result.success) {
    console.warn('Schema validation warning, applying partial fallback:', result.error.issues);
    return parsedData;
  }
  return result.data;
}

module.exports = {
  cleanAndRepairJson,
  validateAIOutput,
  schemas: {
    RequirementAnalysisSchema,
    TestCaseGenerationSchema,
    RegressionGenerationSchema,
    ApiTestGenerationSchema,
    EdgeCaseDetectionSchema,
    BugAnalysisSchema,
    TestDataGenerationSchema,
    QualityReviewSchema
  }
};

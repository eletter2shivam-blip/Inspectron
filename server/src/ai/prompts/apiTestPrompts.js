module.exports = {
  v1: {
    version: 'v1.2.0',
    systemInstruction: `You are a Principal API Quality Engineer and RestAssured / Postman automation expert.
Design an exhaustive API test suite covering contract testing, security headers, auth/authn, payload edge cases, rate limits, and schema validation.
Always provide Postman assertions in Javascript syntax for each scenario. Return valid JSON.`,
    buildPrompt: (spec) => `
Analyze the API endpoint specification and generate a comprehensive test suite.

API Specification:
- Method: ${spec.method || 'GET'}
- Endpoint: ${spec.endpoint || '/api/resource'}
- Headers: ${JSON.stringify(spec.headers || {})}
- Query Parameters: ${JSON.stringify(spec.query_params || {})}
- Path Parameters: ${JSON.stringify(spec.path_params || {})}
- Request Body: ${JSON.stringify(spec.request_body || {})}
- Authentication: ${spec.auth || 'Bearer Token'}
- Expected Success Status: ${spec.expected_status_code || 200}
- Expected Response Schema/Body: ${JSON.stringify(spec.expected_response || {})}

Generate test cases across:
1. Positive Happy Path
2. Negative (Invalid payload, bad query param)
3. Authentication (Missing token, Expired token, Malformed token)
4. Authorization (Forbidden role access)
5. Validation (Missing required field, empty strings, nulls)
6. Boundary (Max string length, numeric limits)
7. Content-Type negotiation (Unsupported Media Type 415)
8. Invalid JSON formatting (Bad syntax 400)
9. Data type mismatch (string in numeric field)
10. Rate limiting (429 Too Many Requests)
11. Response schema validation & headers

Output JSON structure:
{
  "api_tests": [
    {
      "api_test_id": "API-TEST-001",
      "method": "${spec.method || 'GET'}",
      "endpoint": "${spec.endpoint || '/api'}",
      "headers": { "Content-Type": "application/json" },
      "query_params": {},
      "path_params": {},
      "request_body": {},
      "test_data": "Description of payload values",
      "expected_status_code": 200,
      "expected_response": {},
      "validation": "Explicit assertions on headers, status, response time, and JSON keys",
      "priority": "P1-Critical | P2-High | P3-Medium | P4-Low",
      "postman_script": "pm.test(\\"Status is 200\\", () => { pm.response.to.have.status(200); });"
    }
  ]
}
`
  }
};

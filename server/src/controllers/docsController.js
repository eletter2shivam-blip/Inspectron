/**
 * OpenAPI 3.0 Specification Controller for Inspectron QA Platform
 */
const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'INSPECTRON QA API',
    version: '1.0.0',
    description: 'Production-ready REST API powering the Inspectron AI Quality Engineering Platform. Supports requirements analysis, test case versioning, regression impact analysis, SSRF-guarded API execution, background job processing, and Jira synchronization.',
    contact: {
      name: 'Inspectron Engineering',
      email: 'engineering@inspectron.io'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'Inspectron API Gateway'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token generated during /auth/login or /auth/register'
      }
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully.' },
          data: { type: 'object' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation error.' },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid input payload.' },
              details: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      },
      TestCase: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'tc-001' },
          test_case_id: { type: 'string', example: 'TC-LOG-001' },
          project_id: { type: 'string', example: 'proj-inspectron-01' },
          requirement_id: { type: 'string', example: 'REQ-CMG-001' },
          module: { type: 'string', example: 'Login' },
          title: { type: 'string', example: 'Verify successful password reset with valid token' },
          steps: { type: 'array', items: { type: 'string' } },
          expected_result: { type: 'string', example: 'Password updated and user redirected to login.' },
          priority: { type: 'string', enum: ['P1-Critical', 'P2-High', 'P3-Medium', 'P4-Low'] },
          test_type: { type: 'string', example: 'Functional' },
          automation_candidate: { type: 'boolean', example: true },
          status: { type: 'string', enum: ['Draft', 'In Review', 'Approved', 'Rejected'] },
          version: { type: 'integer', example: 1 },
          quality_score: { type: 'integer', example: 95 }
        }
      },
      Job: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'job-1719283-abc' },
          type: { type: 'string', example: 'TEST_CASE_GENERATION' },
          status: { type: 'string', enum: ['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] },
          progress: { type: 'integer', example: 100 },
          result: { type: 'object' },
          error: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          completed_at: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      ApiTest: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'api-001' },
          api_test_id: { type: 'string', example: 'API-POST-001' },
          method: { type: 'string', example: 'POST' },
          endpoint: { type: 'string', example: '/api/v1/auth/reset-password' },
          headers: { type: 'object' },
          request_body: { type: 'object' },
          expected_status_code: { type: 'integer', example: 200 },
          validation: { type: 'string', example: 'Assert 200 OK and response contains token' }
        }
      },
      ApiExecution: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'exec-81a29b01' },
          api_test_case_id: { type: 'string', example: 'api-001' },
          status: { type: 'string', enum: ['PASSED', 'FAILED'] },
          response_status: { type: 'integer', example: 200 },
          response_time_ms: { type: 'integer', example: 142 },
          assertion_results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                passed: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Service Health Check',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Backend is healthy and connected to persistent database store.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'User Authentication',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'lead@inspectron.io' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Authenticated successfully with JWT token.' },
          '401': { description: 'Invalid credentials.' }
        }
      }
    },
    '/dashboard/stats': {
      get: {
        summary: 'Dynamic QA Analytics Dashboard',
        tags: ['Dashboard'],
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string', default: 'proj-inspectron-01' } }
        ],
        responses: {
          '200': { description: 'Dynamically computed dashboard metrics and QA health score.' }
        }
      }
    },
    '/testcases': {
      get: {
        summary: 'List Test Cases with Filter and Pagination',
        tags: ['Test Cases'],
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'module', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } }
        ],
        responses: {
          '200': { description: 'Filtered test cases.' }
        }
      },
      post: {
        summary: 'Create Test Case Manually',
        tags: ['Test Cases'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TestCase' } } }
        },
        responses: {
          '201': { description: 'Test case created and version 1 initialized.' }
        }
      }
    },
    '/testcases/{id}/versions': {
      get: {
        summary: 'Audit Trail of Test Case Changes',
        tags: ['Test Cases'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Array of historical version snapshots.' }
        }
      }
    },
    '/testcases/{id}/approve': {
      post: {
        summary: 'Approve Test Case (QA Lead / Senior QA)',
        tags: ['Test Cases'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Test case marked Approved.' }
        }
      }
    },
    '/api-tests/{id}/execute': {
      post: {
        summary: 'Execute Single API Test with SSRF Guard',
        tags: ['API Execution'],
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Execution result with latency and assertion breakdown.' }
        }
      }
    },
    '/api-tests/execute-all': {
      post: {
        summary: 'Execute All API Tests in Project Suite',
        tags: ['API Execution'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  projectId: { type: 'string', default: 'proj-inspectron-01' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Batch execution results with pass/fail summary.' }
        }
      }
    },
    '/jobs/{id}': {
      get: {
        summary: 'Check Asynchronous Job Status',
        tags: ['Background Jobs'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Live job execution state and progress.' }
        }
      }
    }
  }
};

exports.getOpenApiDocs = (req, res) => {
  res.json(openApiSpec);
};

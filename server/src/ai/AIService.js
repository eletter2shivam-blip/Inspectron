const db = require('../db/database');
const GeminiProvider = require('./providers/GeminiProvider');
const OpenAIProvider = require('./providers/OpenAIProvider');
const AnthropicProvider = require('./providers/AnthropicProvider');
const HeuristicQAEngine = require('./providers/HeuristicQAEngine');
const { schemas } = require('./validator');

// Prompt templates
const reqPrompts = require('./prompts/requirementPrompts');
const tcPrompts = require('./prompts/testCasePrompts');
const regPrompts = require('./prompts/regressionPrompts');
const apiPrompts = require('./prompts/apiTestPrompts');
const edgePrompts = require('./prompts/edgeCasePrompts');
const dataPrompts = require('./prompts/testDataPrompts');
const bugPrompts = require('./prompts/bugPrompts');
const qualPrompts = require('./prompts/qualityPrompts');

class AIService {
  constructor() {
    this.heuristicEngine = new HeuristicQAEngine();
    this.updateProvider();
  }

  updateProvider() {
    const apiKeySetting = db.findOne('app_settings', { key: 'gemini_api_key' });
    const modelSetting = db.findOne('app_settings', { key: 'ai_model' });
    const providerSetting = db.findOne('app_settings', { key: 'ai_provider' });

    const providerType = (providerSetting && providerSetting.value) || process.env.AI_PROVIDER || 'gemini';
    const apiKey = (apiKeySetting && apiKeySetting.value) || process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
    const model = (modelSetting && modelSetting.value) || process.env.AI_MODEL || 'gemini-2.5-flash';

    this.providerType = providerType.toLowerCase();
    this.providerMode = process.env.AI_MODE || 'hybrid'; // 'strict', 'offline', 'hybrid'

    if (this.providerType === 'openai') {
      this.activeProvider = new OpenAIProvider(apiKey || process.env.OPENAI_API_KEY, model || 'gpt-4o-mini');
    } else if (this.providerType === 'anthropic') {
      this.activeProvider = new AnthropicProvider(apiKey || process.env.ANTHROPIC_API_KEY, model || 'claude-3-5-sonnet-20241022');
    } else {
      this.activeProvider = new GeminiProvider(apiKey, model);
    }
  }

  getActivePrompt(featureKey, fileDefault) {
    const dbPrompt = db.findOne('prompt_versions', { feature: featureKey, is_active: true });
    if (dbPrompt) {
      return {
        version: dbPrompt.version,
        template: dbPrompt.prompt_template
      };
    }
    return {
      version: fileDefault.version,
      template: fileDefault.buildPrompt
    };
  }

  logHistory(projectId, feature, inputType, inputPayload, generatedOutput, user, executionTimeMs, modelName, promptVer, usage = {}) {
    try {
      db.insert('ai_generations', {
        project_id: projectId || 'proj-inspectron-01',
        feature,
        input_type: inputType,
        input_payload: typeof inputPayload === 'object' ? JSON.stringify(inputPayload).slice(0, 500) : String(inputPayload).slice(0, 500),
        generated_output: generatedOutput,
        user_id: user ? user.id : 'usr-auto',
        user_name: user ? user.name : 'QA Engineer',
        ai_model: modelName,
        prompt_version: promptVer,
        execution_time_ms: executionTimeMs
      });

      // Also log into normalized ai_usage table
      const inputTokens = usage.inputTokens || Math.max(10, Math.round(String(inputPayload).length / 4));
      const outputTokens = usage.outputTokens || Math.max(15, Math.round(JSON.stringify(generatedOutput).length / 4));
      const estimatedCost = (inputTokens * 0.00000015) + (outputTokens * 0.0000006);

      db.insert('ai_usage', {
        project_id: projectId || 'proj-inspectron-01',
        user_id: user ? user.id : 'usr-auto',
        provider: this.activeProvider?.name || 'Inspectron AI Engine',
        model: modelName,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        duration_ms: executionTimeMs,
        estimated_cost_usd: Number(estimatedCost.toFixed(6)),
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Failed to log AI history/usage:', e.message);
    }
  }

  async executeWithFallback(systemInstruction, userPrompt, schema, heuristicFallbackFn, context = {}) {
    const startTime = Date.now();
    this.updateProvider();

    let result = null;
    let modelUsed = this.heuristicEngine.name;
    let usage = {};

    // Check if real provider is configured
    if (this.activeProvider.isConfigured() && this.providerMode !== 'offline') {
      try {
        const res = await this.activeProvider.generateJSON(systemInstruction, userPrompt, schema);
        result = res.data;
        usage = res.usage || {};
        modelUsed = this.activeProvider.model;
      } catch (err) {
        console.warn(`[AI Engine] ${this.activeProvider.name} failed:`, err.message);
        if (this.providerMode === 'strict') {
          throw err;
        }
      }
    } else if (this.providerMode === 'strict') {
      const err = new Error(`AI Provider "${this.activeProvider.name}" is not configured with an API key.`);
      err.code = 'AI_PROVIDER_NOT_CONFIGURED';
      throw err;
    }

    // Fallback to Heuristic Engine if provider not available
    if (!result) {
      result = await heuristicFallbackFn();
      modelUsed = this.heuristicEngine.name;
    }

    const duration = Date.now() - startTime;
    return { result, modelUsed, duration, usage };
  }

  /**
   * 1. Analyze Requirement
   */
  async analyzeRequirement(requirementText, context = {}, user = null) {
    const activePrompt = this.getActivePrompt('requirement_analysis', reqPrompts.v1);
    const prompt = reqPrompts.v1.buildPrompt(requirementText, context);

    const { result, modelUsed, duration, usage } = await this.executeWithFallback(
      reqPrompts.v1.systemInstruction,
      prompt,
      schemas.RequirementAnalysisSchema,
      () => this.heuristicEngine.analyzeRequirement(requirementText, context),
      context
    );

    this.logHistory(
      context.projectId,
      'Requirement Analysis',
      'Text / Jira Story',
      requirementText,
      result,
      user,
      duration,
      modelUsed,
      activePrompt.version,
      usage
    );

    return result;
  }

  /**
   * 2. Generate Test Cases
   */
  async generateTestCases(requirementText, options = {}, user = null) {
    const activePrompt = this.getActivePrompt('test_case_generation', tcPrompts.v1);
    const prompt = tcPrompts.v1.buildPrompt(requirementText, options);

    const { result, modelUsed, duration, usage } = await this.executeWithFallback(
      tcPrompts.v1.systemInstruction,
      prompt,
      schemas.TestCaseBatchSchema,
      () => this.heuristicEngine.generateTestCases(requirementText, options),
      options
    );

    this.logHistory(
      options.project_id || options.projectId,
      'Test Case Generation',
      'User Story / Spec',
      requirementText,
      result,
      user,
      duration,
      modelUsed,
      activePrompt.version,
      usage
    );

    return result;
  }

  /**
   * 3. Generate Regression Tests
   */
  async generateRegressionTests(changedFeature, affectedModules = [], context = {}, user = null) {
    const activePrompt = this.getActivePrompt('regression_generation', regPrompts.v1);
    const prompt = regPrompts.v1.buildPrompt(changedFeature, affectedModules, context);

    const { result, modelUsed, duration, usage } = await this.executeWithFallback(
      regPrompts.v1.systemInstruction,
      prompt,
      schemas.RegressionSuiteSchema,
      () => this.heuristicEngine.generateRegressionTests(changedFeature, affectedModules, context),
      context
    );

    this.logHistory(
      context.projectId,
      'Regression Generation',
      'Feature Change Trigger',
      { changedFeature, affectedModules },
      result,
      user,
      duration,
      modelUsed,
      activePrompt.version,
      usage
    );

    return result;
  }

  /**
   * 4. Generate API Tests
   */
  async generateApiTests(endpointSpec, context = {}, user = null) {
    const activePrompt = this.getActivePrompt('api_test_generation', apiPrompts.v1);
    const prompt = apiPrompts.v1.buildPrompt(endpointSpec, context);

    const { result, modelUsed, duration, usage } = await this.executeWithFallback(
      apiPrompts.v1.systemInstruction,
      prompt,
      schemas.ApiTestSuiteSchema,
      () => this.heuristicEngine.generateApiTests(endpointSpec, context),
      context
    );

    this.logHistory(
      context.projectId,
      'API Test Generation',
      'OpenAPI / Endpoint Definition',
      endpointSpec,
      result,
      user,
      duration,
      modelUsed,
      activePrompt.version,
      usage
    );

    return result;
  }

  /**
   * 5. Analyze Edge Cases
   */
  async analyzeEdgeCases(featureSpec, context = {}, user = null) {
    const activePrompt = this.getActivePrompt('edge_case_analysis', edgePrompts.v1);
    const prompt = edgePrompts.v1.buildPrompt(featureSpec, context);

    const { result, modelUsed, duration, usage } = await this.executeWithFallback(
      edgePrompts.v1.systemInstruction,
      prompt,
      schemas.EdgeCaseAnalysisSchema,
      () => this.heuristicEngine.analyzeEdgeCases(featureSpec, context),
      context
    );

    this.logHistory(
      context.projectId,
      'Edge Case Analysis',
      'Feature Specification',
      featureSpec,
      result,
      user,
      duration,
      modelUsed,
      activePrompt.version,
      usage
    );

    return result;
  }

  async findEdgeCases(spec, user = null) {
    const featureSpec = spec.requirement || spec.featureSpec || spec;
    const context = {
      projectId: spec.projectId,
      existingTestCases: spec.existingTestCases
    };
    return this.analyzeEdgeCases(featureSpec, context, user);
  }

  /**
   * 6. Generate Synthetic Test Data
   */
  async generateTestData(schemaRequirements, context = {}, user = null) {
    const activePrompt = this.getActivePrompt('test_data_generation', dataPrompts.v1);
    const prompt = dataPrompts.v1.buildPrompt(schemaRequirements, context);

    const { result, modelUsed, duration, usage } = await this.executeWithFallback(
      dataPrompts.v1.systemInstruction,
      prompt,
      schemas.TestDataSetSchema,
      () => this.heuristicEngine.generateTestData(schemaRequirements, context),
      context
    );

    this.logHistory(
      context.projectId,
      'Test Data Generation',
      'Schema & Data Rules',
      schemaRequirements,
      result,
      user,
      duration,
      modelUsed,
      activePrompt.version,
      usage
    );

    return result;
  }

  /**
   * 7. Analyze Bug & RCA
   */
  async analyzeBug(bugReport, context = {}, user = null) {
    const activePrompt = this.getActivePrompt('bug_analysis', bugPrompts.v1);
    const prompt = bugPrompts.v1.buildPrompt(bugReport, context);

    const { result, modelUsed, duration, usage } = await this.executeWithFallback(
      bugPrompts.v1.systemInstruction,
      prompt,
      schemas.BugAnalysisSchema,
      () => this.heuristicEngine.analyzeBug(bugReport, context),
      context
    );

    this.logHistory(
      context.projectId,
      'Bug RCA & Analysis',
      'Defect Report',
      bugReport,
      result,
      user,
      duration,
      modelUsed,
      activePrompt.version,
      usage
    );

    return result;
  }

  /**
   * 8. Review Test Cases (Quality Engine)
   */
  async reviewTestCases(testCases = [], user = null) {
    const activePrompt = this.getActivePrompt('test_case_quality_review', qualPrompts.v1);
    const prompt = qualPrompts.v1.buildPrompt(testCases);

    const { result } = await this.executeWithFallback(
      qualPrompts.v1.systemInstruction,
      prompt,
      schemas.QualityReviewSchema,
      () => this.heuristicEngine.reviewTestCases(testCases),
      {}
    );

    return result;
  }

  /**
   * 9. Analyze Coverage
   */
  async analyzeCoverage(requirements = [], testCases = []) {
    return this.heuristicEngine.analyzeCoverage(requirements, testCases);
  }

  /**
   * 10. Calculate Risk
   */
  async calculateRisk(feature, changes = [], user = null) {
    const riskAnalysis = {
      feature,
      risk_score: Math.min(100, Math.max(10, (changes.length * 15) + (feature.toLowerCase().includes('auth') || feature.toLowerCase().includes('payment') ? 40 : 20))),
      risk_level: 'MEDIUM',
      critical_factors: [
        'Component dependency surface',
        'State transition complexity',
        'External API boundaries'
      ],
      recommendations: [
        'Execute automated regression suite prior to merge',
        'Verify edge case inputs on public endpoints',
        'Perform security sanity check on permission boundaries'
      ]
    };
    if (riskAnalysis.risk_score >= 70) riskAnalysis.risk_level = 'HIGH';
    else if (riskAnalysis.risk_score <= 30) riskAnalysis.risk_level = 'LOW';
    return riskAnalysis;
  }
}

const aiService = new AIService();
module.exports = aiService;

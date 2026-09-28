const db = require('../db/database');
const GeminiProvider = require('./providers/GeminiProvider');
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
    // Read user settings or environment
    const apiKeySetting = db.findOne('app_settings', { key: 'gemini_api_key' });
    const modelSetting = db.findOne('app_settings', { key: 'ai_model' });
    const providerSetting = db.findOne('app_settings', { key: 'ai_provider' });

    const apiKey = (apiKeySetting && apiKeySetting.value) || process.env.GEMINI_API_KEY || '';
    const model = (modelSetting && modelSetting.value) || 'gemini-3.8-flash';
    this.providerMode = (providerSetting && providerSetting.value) || 'hybrid';

    this.geminiProvider = new GeminiProvider(apiKey, model);
  }

  // Get active prompt template or fallback to file-based default
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

  // Log AI generation history (Section 18)
  logHistory(projectId, feature, inputType, inputPayload, generatedOutput, user, executionTimeMs, modelName, promptVer) {
    try {
      db.insert('ai_generations', {
        project_id: projectId || 'default',
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
    } catch (e) {
      console.warn('Failed to log AI history:', e.message);
    }
  }

  /**
   * 1. Analyze Requirement
   */
  async analyzeRequirement(requirementText, context = {}, user = null) {
    const startTime = Date.now();
    this.updateProvider();
    const activePrompt = this.getActivePrompt('requirement_analysis', reqPrompts.v1);
    let result = null;
    let modelUsed = this.heuristicEngine.name;

    // Try Gemini if configured and mode allows
    if (this.geminiProvider.isConfigured() && this.providerMode !== 'offline') {
      try {
        const prompt = reqPrompts.v1.buildPrompt(requirementText, context);
        result = await this.geminiProvider.generate(
          reqPrompts.v1.systemInstruction,
          prompt,
          schemas.RequirementAnalysisSchema
        );
        modelUsed = this.geminiProvider.model;
      } catch (err) {
        console.warn('Gemini failed, falling back to Heuristic QA Engine:', err.message);
      }
    }

    if (!result) {
      result = await this.heuristicEngine.analyzeRequirement(requirementText, context);
    }

    const duration = Date.now() - startTime;
    this.logHistory(
      context.projectId,
      'Requirement Analysis',
      'Text / Jira Story',
      requirementText,
      result,
      user,
      duration,
      modelUsed,
      activePrompt.version
    );

    return result;
  }

  /**
   * 2. Generate Test Cases
   */
  async generateTestCases(requirementText, options = {}, user = null) {
    const startTime = Date.now();
    this.updateProvider();
    const activePrompt = this.getActivePrompt('test_case_generation', tcPrompts.v1);
    let result = null;
    let modelUsed = this.heuristicEngine.name;

    if (this.geminiProvider.isConfigured() && this.providerMode !== 'offline') {
      try {
        const prompt = tcPrompts.v1.buildPrompt(requirementText, options);
        result = await this.geminiProvider.generate(
          tcPrompts.v1.systemInstruction,
          prompt,
          schemas.TestCaseGenerationSchema
        );
        modelUsed = this.geminiProvider.model;
      } catch (err) {
        console.warn('Gemini generation failed, using Heuristic QA Engine:', err.message);
      }
    }

    if (!result || !result.test_cases || result.test_cases.length === 0) {
      result = await this.heuristicEngine.generateTestCases(requirementText, options);
    }

    const duration = Date.now() - startTime;
    this.logHistory(
      options.projectId,
      'Test Case Generation',
      options.requirementId ? `Requirement: ${options.requirementId}` : 'Raw Text',
      requirementText,
      result.test_cases,
      user,
      duration,
      modelUsed,
      activePrompt.version
    );

    return result;
  }

  /**
   * 3. Generate Regression Tests
   */
  async generateRegressionTests(input, user = null) {
    const startTime = Date.now();
    this.updateProvider();
    const activePrompt = this.getActivePrompt('regression_generation', regPrompts.v1);
    let result = null;
    let modelUsed = this.heuristicEngine.name;

    if (this.geminiProvider.isConfigured() && this.providerMode !== 'offline') {
      try {
        const prompt = regPrompts.v1.buildPrompt(input);
        result = await this.geminiProvider.generate(
          regPrompts.v1.systemInstruction,
          prompt,
          schemas.RegressionGenerationSchema
        );
        modelUsed = this.geminiProvider.model;
      } catch (err) {
        console.warn('Gemini regression generation failed, using Heuristic Engine:', err.message);
      }
    }

    if (!result || !result.regression_test_cases) {
      result = await this.heuristicEngine.generateRegressionTests(input);
    }

    const duration = Date.now() - startTime;
    this.logHistory(
      input.projectId,
      'Regression Test Generation',
      'Change Context / Bug Fix',
      input.requirement || input.changes,
      result,
      user,
      duration,
      modelUsed,
      activePrompt.version
    );

    return result;
  }

  /**
   * 4. Generate API Tests
   */
  async generateApiTests(spec, user = null) {
    const startTime = Date.now();
    this.updateProvider();
    const activePrompt = this.getActivePrompt('api_test_generation', apiPrompts.v1);
    let result = null;
    let modelUsed = this.heuristicEngine.name;

    if (this.geminiProvider.isConfigured() && this.providerMode !== 'offline') {
      try {
        const prompt = apiPrompts.v1.buildPrompt(spec);
        result = await this.geminiProvider.generate(
          apiPrompts.v1.systemInstruction,
          prompt,
          schemas.ApiTestGenerationSchema
        );
        modelUsed = this.geminiProvider.model;
      } catch (err) {
        console.warn('Gemini API test gen failed, using Heuristic QA Engine:', err.message);
      }
    }

    if (!result || !result.api_tests) {
      result = await this.heuristicEngine.generateApiTests(spec);
    }

    const duration = Date.now() - startTime;
    this.logHistory(
      spec.projectId,
      'API Test Generation',
      `${spec.method} ${spec.endpoint}`,
      spec,
      result.api_tests,
      user,
      duration,
      modelUsed,
      activePrompt.version
    );

    return result;
  }

  /**
   * 5. Find Edge Cases
   */
  async findEdgeCases(input, user = null) {
    const startTime = Date.now();
    this.updateProvider();
    const activePrompt = this.getActivePrompt('edge_case_detection', edgePrompts.v1);
    let result = null;
    let modelUsed = this.heuristicEngine.name;

    if (this.geminiProvider.isConfigured() && this.providerMode !== 'offline') {
      try {
        const prompt = edgePrompts.v1.buildPrompt(input);
        result = await this.geminiProvider.generate(
          edgePrompts.v1.systemInstruction,
          prompt,
          schemas.EdgeCaseDetectionSchema
        );
        modelUsed = this.geminiProvider.model;
      } catch (err) {
        console.warn('Gemini Edge Case failed, using Heuristic Engine:', err.message);
      }
    }

    if (!result || !result.edge_cases) {
      result = await this.heuristicEngine.findEdgeCases(input);
    }

    const duration = Date.now() - startTime;
    this.logHistory(
      input.projectId,
      'Edge Case Analysis',
      'Requirement & Existing Tests',
      input.requirement,
      result.edge_cases,
      user,
      duration,
      modelUsed,
      activePrompt.version
    );

    return result;
  }

  /**
   * 6. Generate Test Data
   */
  async generateTestData(spec, user = null) {
    const startTime = Date.now();
    this.updateProvider();
    const activePrompt = this.getActivePrompt('test_data_generation', dataPrompts.v1);
    let result = null;
    let modelUsed = this.heuristicEngine.name;

    if (this.geminiProvider.isConfigured() && this.providerMode !== 'offline') {
      try {
        const prompt = dataPrompts.v1.buildPrompt(spec);
        result = await this.geminiProvider.generate(
          dataPrompts.v1.systemInstruction,
          prompt,
          schemas.TestDataGenerationSchema
        );
        modelUsed = this.geminiProvider.model;
      } catch (err) {
        console.warn('Gemini test data gen failed, using Heuristic Engine:', err.message);
      }
    }

    if (!result || !result.records) {
      result = await this.heuristicEngine.generateTestData(spec);
    }

    const duration = Date.now() - startTime;
    this.logHistory(
      spec.projectId,
      'Test Data Generation',
      `${spec.field_name} (${spec.data_type}) - Count: ${spec.quantity}`,
      spec,
      result,
      user,
      duration,
      modelUsed,
      activePrompt.version
    );

    return result;
  }

  /**
   * 7. Analyze Bug
   */
  async analyzeBug(bug, user = null) {
    const startTime = Date.now();
    this.updateProvider();
    const activePrompt = this.getActivePrompt('bug_analysis', bugPrompts.v1);
    let result = null;
    let modelUsed = this.heuristicEngine.name;

    if (this.geminiProvider.isConfigured() && this.providerMode !== 'offline') {
      try {
        const prompt = bugPrompts.v1.buildPrompt(bug);
        result = await this.geminiProvider.generate(
          bugPrompts.v1.systemInstruction,
          prompt,
          schemas.BugAnalysisSchema
        );
        modelUsed = this.geminiProvider.model;
      } catch (err) {
        console.warn('Gemini bug analysis failed, using Heuristic Engine:', err.message);
      }
    }

    if (!result || !result.bug_summary) {
      result = await this.heuristicEngine.analyzeBug(bug);
    }

    const duration = Date.now() - startTime;
    this.logHistory(
      bug.projectId,
      'Bug Analysis & Regression',
      `Defect: ${bug.title}`,
      bug,
      result,
      user,
      duration,
      modelUsed,
      activePrompt.version
    );

    return result;
  }

  /**
   * 8. Review Test Cases (Quality Engine)
   */
  async reviewTestCases(testCases = [], user = null) {
    const startTime = Date.now();
    this.updateProvider();
    const activePrompt = this.getActivePrompt('test_case_quality_review', qualPrompts.v1);
    let result = null;
    let modelUsed = this.heuristicEngine.name;

    if (this.geminiProvider.isConfigured() && this.providerMode !== 'offline') {
      try {
        const prompt = qualPrompts.v1.buildPrompt(testCases);
        result = await this.geminiProvider.generate(
          qualPrompts.v1.systemInstruction,
          prompt,
          schemas.QualityReviewSchema
        );
        modelUsed = this.geminiProvider.model;
      } catch (err) {
        console.warn('Gemini Quality review failed, using Heuristic Engine:', err.message);
      }
    }

    if (!result || typeof result.quality_score !== 'number') {
      result = await this.heuristicEngine.reviewTestCases(testCases);
    }

    return result;
  }

  /**
   * 9. Analyze Coverage
   */
  async analyzeCoverage(requirements = [], testCases = []) {
    return this.heuristicEngine.analyzeCoverage(requirements, testCases);
  }
}

const aiService = new AIService();
module.exports = aiService;

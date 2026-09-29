/**
 * Abstract AI Provider Interface
 */
class AIProvider {
  constructor(name, apiKey = '', model = '') {
    this.name = name;
    this.apiKey = apiKey;
    this.model = model;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Generates structured JSON from LLM.
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @param {Object} [schema] - Zod schema for validation
   * @param {Object} [options] - Temperature, maxTokens, etc.
   * @returns {Promise<{ data: Object, usage: { inputTokens: number, outputTokens: number } }>}
   */
  async generateJSON(systemPrompt, userPrompt, schema = null, options = {}) {
    throw new Error(`generateJSON() must be implemented by ${this.constructor.name}`);
  }
}

module.exports = AIProvider;

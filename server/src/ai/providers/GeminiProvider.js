const { GoogleGenAI } = require('@google/genai');
const AIProvider = require('./AIProvider');
const { validateAIOutput, cleanAndRepairJson } = require('../validator');

class GeminiProvider extends AIProvider {
  constructor(apiKey = '', model = 'gemini-2.5-flash') {
    super('Google Gemini', apiKey || process.env.GEMINI_API_KEY, model || 'gemini-2.5-flash');
    this.client = this.apiKey ? new GoogleGenAI({ apiKey: this.apiKey }) : null;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && this.client);
  }

  async generateJSON(systemInstruction, userPrompt, schema = null, options = {}) {
    if (!this.isConfigured()) {
      const err = new Error('Gemini API key is not configured.');
      err.code = 'AI_PROVIDER_NOT_CONFIGURED';
      throw err;
    }

    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        config: {
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          responseMimeType: 'application/json',
          temperature: options.temperature || 0.2
        }
      });

      const text = response.text || '{}';
      const validatedData = schema ? validateAIOutput(schema, text) : JSON.parse(cleanAndRepairJson(text));

      const usageMetadata = response.usageMetadata || {};
      return {
        data: validatedData,
        usage: {
          inputTokens: usageMetadata.promptTokenCount || 0,
          outputTokens: usageMetadata.candidatesTokenCount || 0
        }
      };
    } catch (err) {
      console.error(`Gemini Provider API error with model ${this.model}:`, err.message);
      throw err;
    }
  }

  // Backward-compatible method
  async generate(systemInstruction, userPrompt, schema) {
    const res = await this.generateJSON(systemInstruction, userPrompt, schema);
    return res.data;
  }
}

module.exports = GeminiProvider;

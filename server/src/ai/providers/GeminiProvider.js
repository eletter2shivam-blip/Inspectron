const { GoogleGenAI } = require('@google/genai');
const { validateAIOutput, cleanAndRepairJson } = require('../validator');

class GeminiProvider {
  constructor(apiKey, model = 'gemini-3.8-flash') {
    this.name = 'Google Gemini Provider';
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    this.model = model || 'gemini-3.8-flash';
    this.client = this.apiKey ? new GoogleGenAI({ apiKey: this.apiKey }) : null;
  }

  isConfigured() {
    return !!(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generate(systemInstruction, userPrompt, schema) {
    if (!this.client) {
      throw new Error('Gemini API key is not configured.');
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
          temperature: 0.2
        }
      });

      const text = response.text || '';
      return validateAIOutput(schema, text);
    } catch (err) {
      console.error(`Gemini Provider API error with model ${this.model}:`, err.message);
      throw err;
    }
  }
}

module.exports = GeminiProvider;

const AIProvider = require('./AIProvider');

class AnthropicProvider extends AIProvider {
  constructor(apiKey = '', model = 'claude-3-5-sonnet-20241022') {
    super('Anthropic', apiKey, model);
  }

  async generateJSON(systemPrompt, userPrompt, schema = null, options = {}) {
    if (!this.isConfigured()) {
      const err = new Error('Anthropic API Key is not configured');
      err.code = 'AI_PROVIDER_NOT_CONFIGURED';
      throw err;
    }

    const payload = {
      model: this.model,
      system: `${systemPrompt}\nIMPORTANT: Respond ONLY with a valid JSON object matching the requested schema. No markdown formatting.`,
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.2
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      const err = new Error(`Anthropic API Error: ${errBody}`);
      err.code = 'AI_PROVIDER_ERROR';
      throw err;
    }

    const json = await response.json();
    const rawContent = json.content?.[0]?.text || '{}';
    const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      data: parsed,
      usage: {
        inputTokens: json.usage?.input_tokens || 0,
        outputTokens: json.usage?.output_tokens || 0
      }
    };
  }
}

module.exports = AnthropicProvider;

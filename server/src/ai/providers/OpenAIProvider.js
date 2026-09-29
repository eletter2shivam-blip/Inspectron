const AIProvider = require('./AIProvider');

class OpenAIProvider extends AIProvider {
  constructor(apiKey = '', model = 'gpt-4o-mini') {
    super('OpenAI', apiKey, model);
  }

  async generateJSON(systemPrompt, userPrompt, schema = null, options = {}) {
    if (!this.isConfigured()) {
      const err = new Error('OpenAI API Key is not configured');
      err.code = 'AI_PROVIDER_NOT_CONFIGURED';
      throw err;
    }

    const payload = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: options.temperature || 0.2
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      const err = new Error(`OpenAI API Error: ${errBody}`);
      err.code = 'AI_PROVIDER_ERROR';
      throw err;
    }

    const json = await response.json();
    const rawContent = json.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(rawContent);

    return {
      data: parsed,
      usage: {
        inputTokens: json.usage?.prompt_tokens || 0,
        outputTokens: json.usage?.completion_tokens || 0
      }
    };
  }
}

module.exports = OpenAIProvider;

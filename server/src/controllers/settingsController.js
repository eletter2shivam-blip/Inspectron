const db = require('../db/database');
const aiService = require('../ai/AIService');

exports.getSettings = (req, res, next) => {
  try {
    const settings = db.find('app_settings');
    const settingsMap = {};
    settings.forEach(s => {
      if (s.key === 'gemini_api_key' && s.value) {
        settingsMap[s.key] = `••••••••••••${s.value.slice(-4)}`;
      } else {
        settingsMap[s.key] = s.value;
      }
    });

    res.json({
      success: true,
      settings: {
        ai_provider: settingsMap.ai_provider || 'hybrid',
        ai_model: settingsMap.ai_model || 'gemini-3.8-flash',
        gemini_api_key_configured: !!(settingsMap.gemini_api_key || process.env.GEMINI_API_KEY),
        gemini_api_key_masked: settingsMap.gemini_api_key || (process.env.GEMINI_API_KEY ? '••••••••••••ENV' : ''),
        available_models: [
          { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Recommended - Fast & Agentic)', default: true },
          { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite (High Throughput)' },
          { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview (Deep Reasoning & Complex QA)' }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = (req, res, next) => {
  try {
    const { ai_provider, ai_model, gemini_api_key } = req.body;

    const upsert = (key, value, description) => {
      const existing = db.findOne('app_settings', { key });
      if (existing) {
        db.update('app_settings', existing.id, { value, updated_at: new Date().toISOString() });
      } else {
        db.insert('app_settings', { key, value, description });
      }
    };

    if (ai_provider) upsert('ai_provider', ai_provider, 'AI Provider execution mode');
    if (ai_model) upsert('ai_model', ai_model, 'Default Gemini AI model');
    if (gemini_api_key && gemini_api_key.trim().length > 0) {
      upsert('gemini_api_key', gemini_api_key.trim(), 'Google Gemini API Key');
    }

    // Refresh AIService provider
    aiService.updateProvider();

    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.getAuditLogs = (req, res, next) => {
  try {
    const logs = db.find('audit_logs', null, { created_at: 'desc' }, { page: 1, limit: 100 }).items || [];
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
};

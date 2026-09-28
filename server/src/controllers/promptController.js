const db = require('../db/database');

exports.getPromptVersions = (req, res, next) => {
  try {
    const { feature } = req.query;
    const filter = feature ? { feature } : null;
    const prompts = db.find('prompt_versions', filter, { created_at: 'desc' });
    res.json({ success: true, prompts });
  } catch (err) {
    next(err);
  }
};

exports.updatePromptVersion = (req, res, next) => {
  try {
    const { id } = req.params;
    const { prompt_template, is_active } = req.body;

    const existing = db.findById('prompt_versions', id);
    if (!existing) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Prompt version not found.' });
    }

    if (is_active) {
      // Deactivate other versions for the same feature
      const sameFeature = db.find('prompt_versions', { feature: existing.feature });
      sameFeature.forEach(p => {
        if (p.id !== id) {
          db.update('prompt_versions', p.id, { is_active: false });
        }
      });
    }

    const updated = db.update('prompt_versions', id, {
      ...(prompt_template !== undefined && { prompt_template }),
      ...(is_active !== undefined && { is_active })
    });

    res.json({ success: true, prompt: updated });
  } catch (err) {
    next(err);
  }
};

exports.createPromptVersion = (req, res, next) => {
  try {
    const { feature, version, prompt_template, is_active = false } = req.body;
    if (!feature || !version || !prompt_template) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Feature, version string, and prompt template are required.' });
    }

    if (is_active) {
      const existing = db.find('prompt_versions', { feature });
      existing.forEach(p => db.update('prompt_versions', p.id, { is_active: false }));
    }

    const newPrompt = db.insert('prompt_versions', {
      feature,
      version,
      prompt_template,
      is_active
    });

    res.status(201).json({ success: true, prompt: newPrompt });
  } catch (err) {
    next(err);
  }
};

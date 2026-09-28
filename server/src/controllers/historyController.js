const db = require('../db/database');

exports.getHistory = (req, res, next) => {
  try {
    const { projectId, feature } = req.query;
    const filterFn = (h) => {
      if (projectId && h.project_id !== projectId) return false;
      if (feature && h.feature !== feature) return false;
      return true;
    };
    const history = db.find('ai_generations', filterFn, { created_at: 'desc' });
    res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
};

exports.getHistoryById = (req, res, next) => {
  try {
    const entry = db.findById('ai_generations', req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'History record not found.' });
    }
    res.json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

exports.clearHistory = (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (projectId) {
      db.removeWhere('ai_generations', { project_id: projectId });
    } else {
      db.removeWhere('ai_generations', () => true);
    }
    res.json({ success: true, message: 'Generation history cleared.' });
  } catch (err) {
    next(err);
  }
};

const db = require('../db/database');
const aiService = require('../ai/AIService');

exports.getRequirements = (req, res, next) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { project_id: projectId } : null;
    const requirements = db.find('requirements', filter, { created_at: 'desc' });
    res.json({ success: true, requirements });
  } catch (err) {
    next(err);
  }
};

exports.getRequirementById = (req, res, next) => {
  try {
    const requirement = db.findById('requirements', req.params.id);
    if (!requirement) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Requirement not found.' });
    }
    // Fetch associated test cases
    const testCases = db.find('test_cases', { requirement_id: requirement.id });
    res.json({ success: true, requirement: { ...requirement, test_cases: testCases } });
  } catch (err) {
    next(err);
  }
};

exports.analyzeRequirement = async (req, res, next) => {
  try {
    const { requirement_text, title, project_id, source = 'Manual Input' } = req.body;
    if (!requirement_text || requirement_text.trim().length === 0) {
      return res.status(400).json({ error: 'EMPTY_REQUIREMENT', message: 'Requirement text is required for analysis.' });
    }

    const project = project_id ? db.findById('projects', project_id) : null;
    const context = {
      projectId: project_id,
      projectName: project ? project.name : 'CMGalaxy',
      modules: project ? project.modules : []
    };

    // Run AI analysis
    const analysis = await aiService.analyzeRequirement(requirement_text, context, req.user);

    // Generate requirement ID
    const count = db.count('requirements', { project_id: project_id || 'proj-cmgalaxy-01' });
    const reqId = `REQ-${(project?.name || 'CMG').slice(0, 3).toUpperCase()}-${String(count + 1).padStart(3, '0')}`;

    // Auto-create or save requirement record if requested
    const saved = db.insert('requirements', {
      id: reqId,
      project_id: project_id || 'proj-cmgalaxy-01',
      title: title || analysis.summary.slice(0, 60) + '...',
      source,
      status: 'Analyzed',
      raw_text: requirement_text,
      analysis_result: analysis
    });

    res.json({
      success: true,
      requirement_id: saved.id,
      analysis,
      requirement: saved
    });
  } catch (err) {
    next(err);
  }
};

exports.updateRequirement = (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = db.update('requirements', id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Requirement not found.' });
    }
    res.json({ success: true, requirement: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteRequirement = (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = db.remove('requirements', id);
    if (!removed) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Requirement not found.' });
    }
    res.json({ success: true, message: 'Requirement removed successfully.' });
  } catch (err) {
    next(err);
  }
};

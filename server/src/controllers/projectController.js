const db = require('../db/database');
const { seedDatabase } = require('../db/seed');

exports.getProjects = (req, res, next) => {
  try {
    const projects = db.find('projects', null, { created_at: 'desc' });
    res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
};

exports.getProjectById = (req, res, next) => {
  try {
    const project = db.findById('projects', req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'PROJECT_NOT_FOUND', message: 'Project not found.' });
    }

    // Attach entity counts for this project
    const reqCount = db.count('requirements', { project_id: project.id });
    const tcCount = db.count('test_cases', { project_id: project.id });
    const bugCount = db.count('bugs', { project_id: project.id });
    const apiCount = db.count('api_tests', { project_id: project.id });

    res.json({
      success: true,
      project: {
        ...project,
        stats: {
          requirements: reqCount,
          testCases: tcCount,
          bugs: bugCount,
          apiTests: apiCount
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createProject = (req, res, next) => {
  try {
    const { name, description, application_name, environment, technology, modules } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'MISSING_NAME', message: 'Project name is required.' });
    }

    let parsedModules = modules;
    if (typeof modules === 'string') {
      parsedModules = modules.split(',').map(m => m.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedModules) || parsedModules.length === 0) {
      parsedModules = ['Dashboard', 'Authentication', 'Settings'];
    }

    const newProject = db.insert('projects', {
      name: name.trim(),
      description: description || '',
      application_name: application_name || name,
      environment: environment || 'Staging',
      technology: technology || 'Web / API',
      modules: parsedModules
    });

    res.status(201).json({ success: true, project: newProject });
  } catch (err) {
    next(err);
  }
};

exports.updateProject = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.findById('projects', id);
    if (!existing) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Project not found.' });
    }

    const { name, description, application_name, environment, technology, modules } = req.body;
    let parsedModules = modules;
    if (typeof modules === 'string') {
      parsedModules = modules.split(',').map(m => m.trim()).filter(Boolean);
    }

    const updated = db.update('projects', id, {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description }),
      ...(application_name && { application_name }),
      ...(environment && { environment }),
      ...(technology && { technology }),
      ...(parsedModules && { modules: parsedModules })
    });

    res.json({ success: true, project: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = (req, res, next) => {
  try {
    const { id } = req.params;
    const success = db.remove('projects', id);
    if (!success) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Project not found.' });
    }

    // Cascade clean related records
    db.removeWhere('requirements', { project_id: id });
    db.removeWhere('test_cases', { project_id: id });
    db.removeWhere('api_tests', { project_id: id });
    db.removeWhere('regression_tests', { project_id: id });
    db.removeWhere('bugs', { project_id: id });
    db.removeWhere('coverage_records', { project_id: id });

    res.json({ success: true, message: 'Project and associated entities removed.' });
  } catch (err) {
    next(err);
  }
};

exports.resetDemoData = async (req, res, next) => {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'CMGalaxy demo project restored successfully.' });
  } catch (err) {
    next(err);
  }
};

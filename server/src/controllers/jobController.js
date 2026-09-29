const jobQueue = require('../services/JobQueue');

exports.getJobStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const job = jobQueue.getJob(id);

    if (!job) {
      if (res.fail) return res.fail('JOB_NOT_FOUND', `Job ${id} not found`, [], 404);
      return res.status(404).json({ success: false, error: 'JOB_NOT_FOUND', message: `Job ${id} not found` });
    }

    if (res.success) {
      return res.success(job, 'Job status retrieved');
    }
    return res.json({ success: true, ...job });
  } catch (err) {
    next(err);
  }
};

exports.listJobs = (req, res, next) => {
  try {
    const { projectId, status, operation, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (projectId) filter.project_id = projectId;
    if (status) filter.status = status;
    if (operation) filter.operation = operation;

    const result = jobQueue.listJobs(filter, { created_at: 'desc' }, { page, limit });

    if (res.success) {
      return res.success(result, 'Jobs retrieved');
    }
    return res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.cancelJob = (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = jobQueue.cancelJob(id);

    if (!updated) {
      if (res.fail) return res.fail('JOB_NOT_FOUND', `Job ${id} not found`, [], 404);
      return res.status(404).json({ success: false, error: 'JOB_NOT_FOUND' });
    }

    if (res.success) {
      return res.success(updated, `Job ${id} cancelled`);
    }
    return res.json({ success: true, job: updated });
  } catch (err) {
    next(err);
  }
};

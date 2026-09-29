const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');

class JobQueue {
  constructor() {
    this.activeWorkers = new Map();
  }

  /**
   * Enqueues a new background AI generation job.
   * @param {Object} params
   * @param {string} params.projectId
   * @param {string} params.userId
   * @param {string} params.operation - E.g. 'TESTCASE_GENERATION', 'REQUIREMENT_ANALYSIS'
   * @param {Object} params.payload - Input arguments
   * @param {Function} [taskRunner] - Async function that executes the job
   * @returns {Object} Created job record
   */
  createJob({ projectId, userId, operation, payload }, taskRunner = null) {
    const jobId = `job_${uuidv4().slice(0, 10)}`;
    const now = new Date().toISOString();

    const job = {
      id: jobId,
      project_id: projectId || 'proj-inspectron-01',
      user_id: userId || 'usr-system',
      operation,
      status: 'QUEUED',
      progress: 0,
      input_payload: payload || {},
      result: null,
      error: null,
      created_at: now,
      updated_at: now
    };

    db.insert('ai_generation_jobs', job);

    // If an async task runner was passed, dispatch it asynchronously
    if (typeof taskRunner === 'function') {
      this.executeAsync(jobId, taskRunner);
    }

    return job;
  }

  async executeAsync(jobId, taskRunner) {
    // Transition to RUNNING
    this.updateJob(jobId, { status: 'RUNNING', progress: 15 });

    const abortController = new AbortController();
    this.activeWorkers.set(jobId, abortController);

    try {
      // Simulate/execute task with progress reporting
      const reportProgress = (pct) => {
        this.updateJob(jobId, { progress: Math.min(95, pct) });
      };

      const result = await taskRunner({
        signal: abortController.signal,
        reportProgress
      });

      // Complete Job
      this.updateJob(jobId, {
        status: 'COMPLETED',
        progress: 100,
        result,
        completed_at: new Date().toISOString()
      });
    } catch (err) {
      if (abortController.signal.aborted) {
        this.updateJob(jobId, {
          status: 'CANCELLED',
          error: { message: 'Job was cancelled by user' }
        });
      } else {
        console.error(`[JOB QUEUE] Job ${jobId} failed:`, err);
        this.updateJob(jobId, {
          status: 'FAILED',
          error: { message: err.message || 'Job execution failed', code: err.code || 'JOB_EXECUTION_ERROR' }
        });
      }
    } finally {
      this.activeWorkers.delete(jobId);
    }
  }

  updateJob(jobId, updates) {
    return db.update('ai_generation_jobs', jobId, updates);
  }

  updateProgress(jobId, progress) {
    const status = progress >= 100 ? 'COMPLETED' : 'RUNNING';
    return this.updateJob(jobId, { progress, status, updated_at: new Date().toISOString() });
  }

  completeJob(jobId, result = {}) {
    return this.updateJob(jobId, {
      status: 'COMPLETED',
      progress: 100,
      result,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  getJob(jobId) {
    return db.findById('ai_generation_jobs', jobId);
  }

  listJobs(filter = null, sort = { created_at: 'desc' }, pagination = { page: 1, limit: 20 }) {
    return db.find('ai_generation_jobs', filter, sort, pagination);
  }

  cancelJob(jobId) {
    const job = this.getJob(jobId);
    if (!job) return null;

    if (this.activeWorkers.has(jobId)) {
      this.activeWorkers.get(jobId).abort();
    }

    return this.updateJob(jobId, {
      status: 'CANCELLED',
      updated_at: new Date().toISOString()
    });
  }
}

const jobQueue = new JobQueue();
module.exports = jobQueue;

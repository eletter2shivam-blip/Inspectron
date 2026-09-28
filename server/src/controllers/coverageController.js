const db = require('../db/database');
const aiService = require('../ai/AIService');

exports.getCoverageMatrix = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { project_id: projectId } : null;

    const requirements = db.find('requirements', filter);
    const testCases = db.find('test_cases', filter);

    // Calculate dynamic traceability matrix
    const matrix = await aiService.analyzeCoverage(requirements, testCases);

    // Calculate aggregate metrics
    const totalReqs = matrix.length;
    const completeCount = matrix.filter(m => m.coverage_status === 'Complete').length;
    const partialCount = matrix.filter(m => m.coverage_status === 'Partial').length;
    const missingCount = matrix.filter(m => m.coverage_status === 'Missing').length;

    const overallCoveragePct = totalReqs > 0
      ? Math.round((completeCount * 100 + partialCount * 50) / totalReqs)
      : 0;

    res.json({
      success: true,
      matrix,
      summary: {
        totalRequirements: totalReqs,
        complete: completeCount,
        partial: partialCount,
        missing: missingCount,
        overallCoveragePercentage: overallCoveragePct
      }
    });
  } catch (err) {
    next(err);
  }
};

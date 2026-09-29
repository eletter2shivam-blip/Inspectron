const db = require('../db/database');

class QAHealthEngine {
  /**
   * Calculates transparent QA Health Score from measurable database metrics.
   * @param {string} projectId
   * @returns {Object} QA Health report with formula breakdown and grade
   */
  static calculateProjectHealth(projectId) {
    const projectFilter = projectId ? { project_id: projectId } : null;

    const requirements = db.find('requirements', projectFilter);
    const testCases = db.find('test_cases', projectFilter);
    const executions = db.find('test_executions', projectFilter);
    const apiTests = db.find('api_tests', projectFilter);
    const bugs = db.find('bugs', projectFilter);

    const totalRequirements = requirements.length;
    const totalTestCases = testCases.length;

    // 1. Requirement Coverage Factor (Weight: 25%)
    let coveredReqsCount = 0;
    requirements.forEach(req => {
      const casesForReq = testCases.filter(tc => tc.requirement_id === req.id && tc.status === 'APPROVED');
      if (casesForReq.length > 0) coveredReqsCount++;
    });
    const requirementCoverage = totalRequirements > 0
      ? Math.round((coveredReqsCount / totalRequirements) * 100)
      : 0;

    // 2. Approved Test Ratio (Weight: 20%)
    const approvedTestCases = testCases.filter(tc => tc.status === 'APPROVED').length;
    const approvalRatio = totalTestCases > 0
      ? Math.round((approvedTestCases / totalTestCases) * 100)
      : 0;

    // 3. Execution Pass Rate (Weight: 20%)
    let executionPassRate = 100;
    if (executions.length > 0) {
      const passed = executions.filter(e => e.status === 'PASSED').length;
      executionPassRate = Math.round((passed / executions.length) * 100);
    }

    // 4. Automation Candidate Coverage (Weight: 15%)
    const automationCandidates = testCases.filter(tc => tc.automation_candidate === true).length;
    const automationCoverage = totalTestCases > 0
      ? Math.round((automationCandidates / totalTestCases) * 100)
      : 0;

    // 5. API Testing Coverage (Weight: 10%)
    const targetApiTests = Math.max(1, totalRequirements * 2);
    const apiCoverage = Math.min(100, Math.round((apiTests.length / targetApiTests) * 100));

    // 6. Defect Penalty (Weight: 10%)
    const criticalBugs = bugs.filter(b => b.severity === 'Critical' || b.priority === 'P1').length;
    const highBugs = bugs.filter(b => b.severity === 'High' || b.priority === 'P2').length;
    const defectPenalty = Math.min(100, (criticalBugs * 25) + (highBugs * 10));
    const defectScore = Math.max(0, 100 - defectPenalty);

    // Weighted Formula:
    const weights = {
      requirementCoverage: 0.25,
      approvalRatio: 0.20,
      executionPassRate: 0.20,
      automationCoverage: 0.15,
      apiCoverage: 0.10,
      defectScore: 0.10
    };

    const rawScore =
      (requirementCoverage * weights.requirementCoverage) +
      (approvalRatio * weights.approvalRatio) +
      (executionPassRate * weights.executionPassRate) +
      (automationCoverage * weights.automationCoverage) +
      (apiCoverage * weights.apiCoverage) +
      (defectScore * weights.defectScore);

    const healthScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    let status = 'CRITICAL';
    if (healthScore >= 85) status = 'EXCELLENT';
    else if (healthScore >= 70) status = 'GOOD';
    else if (healthScore >= 50) status = 'NEEDS_ATTENTION';

    return {
      healthScore,
      status,
      calculatedAt: new Date().toISOString(),
      formula: '0.25*ReqCoverage + 0.20*ApprovalRatio + 0.20*ExecPassRate + 0.15*AutomationRatio + 0.10*ApiCoverage + 0.10*DefectScore',
      weights: {
        requirementCoverageWeight: weights.requirementCoverage,
        approvalRatioWeight: weights.approvalRatio,
        executionPassRateWeight: weights.executionPassRate,
        automationRatioWeight: weights.automationCoverage,
        apiCoverageWeight: weights.apiCoverage,
        defectPenaltyWeight: weights.defectScore
      },
      breakdown: {
        totalRequirements,
        coveredRequirements: coveredReqsCount,
        requirementCoveragePct: requirementCoverage,
        totalTestCases,
        approvedTestCases,
        approvalRatioPct: approvalRatio,
        executionPassRatePct: executionPassRate,
        automationCoveragePct: automationCoverage,
        apiTestCount: apiTests.length,
        apiCoveragePct: apiCoverage,
        openCriticalBugs: criticalBugs,
        openHighBugs: highBugs,
        defectScore
      }
    };
  }
}

module.exports = QAHealthEngine;

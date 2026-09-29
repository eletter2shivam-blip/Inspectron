const db = require('../db/database');
const aiService = require('../ai/AIService');

const SAMPLE_REQUIREMENTS = [
  {
    id: 'sample-01',
    title: 'Self-Service Password Reset (Jira: CMG-104)',
    text: 'As a user, I want to reset my password using my registered email so that I can regain access to my account. The link should expire in 15 minutes, be single-use, and enforce strong password complexity (min 8 chars, 1 uppercase, 1 special char). Rate limit to 3 requests per hour.',
    category: 'Authentication & Security',
    tags: ['auth', 'jwt', 'security', 'rate-limit']
  },
  {
    id: 'sample-02',
    title: 'Omnichannel Campaign Creation (PRD-Campaign)',
    text: 'As an agency marketing lead, I want to create a unified marketing campaign in Inspectron and simultaneously push budgets, audiences, and ad creative to Google Ads and Meta Ads Manager, so that I can manage omnichannel campaigns from one single dashboard without context switching.',
    category: 'Integrations & Multi-Platform',
    tags: ['campaigns', 'google-ads', 'meta-ads', 'api-integration']
  },
  {
    id: 'sample-03',
    title: 'CSV Bulk Lead Import with Validation',
    text: 'As a sales administrator, I want to upload a CSV file with up to 10,000 lead records and validate email formats, phone numbers, and duplicate entries, so that invalid records are flagged before importing into PostgreSQL.',
    category: 'Data Ingestion & Validation',
    tags: ['csv', 'bulk-upload', 'validation', 'postgresql']
  },
  {
    id: 'sample-04',
    title: 'Real-time Webhook Event Dispatcher with DLQ',
    text: 'As an API platform developer, I want outbound webhook events (e.g. test_case.completed, bug.reported) delivered to customer endpoints with HMAC-SHA256 signature verification, exponential backoff retries across 5 attempts, and automatic Dead-Letter Queue (DLQ) routing upon terminal failure.',
    category: 'Distributed Systems & Queues',
    tags: ['webhooks', 'hmac', 'security', 'dlq', 'reliability']
  }
];

/**
 * 1. Get List of Quick Requirement Samples
 */
exports.getSamples = (req, res, next) => {
  try {
    res.json({
      success: true,
      samples: SAMPLE_REQUIREMENTS,
      count: SAMPLE_REQUIREMENTS.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Get Requirements List
 */
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

/**
 * 3. Get Single Requirement by ID
 */
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

/**
 * 4. Deep QA Analysis of Requirement (10-Dimension Analysis)
 */
exports.analyzeRequirement = async (req, res, next) => {
  try {
    const {
      requirement_text,
      text,
      raw_text,
      description,
      title,
      project_id,
      jira_issue_key,
      uploaded_document,
      source = 'Requirement Analyzer'
    } = req.body;

    const inputContent = requirement_text || text || raw_text || description || '';
    const fullRequirementText = [inputContent.trim(), (uploaded_document || '').trim()]
      .filter(Boolean)
      .join('\n\n--- Attached Document ---\n\n');

    if (!fullRequirementText || fullRequirementText.trim().length === 0) {
      return res.status(400).json({
        error: 'EMPTY_REQUIREMENT',
        message: 'Requirement text or document content is required for analysis.'
      });
    }

    const targetProjectId = project_id || 'proj-inspectron-01';
    const project = db.findById('projects', targetProjectId);
    const context = {
      projectId: targetProjectId,
      projectName: project ? project.name : 'Inspectron Quality Platform',
      modules: project ? project.modules : ['Authentication', 'Dashboard', 'API Engine'],
      jiraIssueKey: jira_issue_key || null
    };

    // Run AI analysis through multi-provider engine (with deterministic Heuristic fallback)
    const analysis = await aiService.analyzeRequirement(fullRequirementText, context, req.user);

    // Fallback normalization: ensure quality_score and risk_assessment exist
    if (!analysis.quality_score) {
      analysis.quality_score = {
        overall: 85,
        clarity: 85,
        completeness: 80,
        testability: 90,
        specificity: 85
      };
    }
    if (!analysis.risk_assessment) {
      analysis.risk_assessment = {
        overall_score: 45,
        risk_level: 'MEDIUM',
        breakdown: {
          functional: 40,
          security: 55,
          performance: 35,
          data_integrity: 45,
          concurrency: 50
        }
      };
    }

    // Format analysis.quality_score and risk for backward compatibility
    analysis.qualityScore = analysis.quality_score;
    analysis.riskAssessment = analysis.risk_assessment;
    analysis.risk_score = analysis.risk_assessment.overall_score;
    analysis.risk_level = analysis.risk_assessment.risk_level;

    // Generate requirement & analysis ID
    const count = db.count('requirements', { project_id: targetProjectId });
    const reqCode = (project?.name || 'CMG').slice(0, 3).toUpperCase();
    const reqId = `REQ-${reqCode}-${String(count + 1).padStart(3, '0')}`;
    const analysisId = `ANL-${reqId}-${Date.now().toString().slice(-4)}`;

    const reqTitle = title || (analysis.summary ? analysis.summary.slice(0, 60) + '...' : `Requirement ${reqId}`);

    // Persist to requirements table
    const saved = db.insert('requirements', {
      id: reqId,
      project_id: targetProjectId,
      title: reqTitle,
      source,
      status: 'Analyzed',
      raw_text: fullRequirementText,
      analysis_result: analysis,
      created_by: req.user ? req.user.id : 'usr-lead-01',
      created_at: new Date().toISOString()
    });

    // Also persist to requirement_analyses collection
    const savedAnalysis = db.insert('requirement_analyses', {
      id: analysisId,
      requirement_id: reqId,
      project_id: targetProjectId,
      title: reqTitle,
      analysis_data: analysis,
      quality_score: analysis.quality_score.overall,
      risk_level: analysis.risk_assessment.risk_level,
      created_by: req.user ? req.user.id : 'usr-lead-01',
      created_at: new Date().toISOString()
    });

    // Return standardized production response
    res.json({
      success: true,
      analysisId: savedAnalysis.id,
      requirement_id: saved.id,
      status: 'COMPLETED',
      data: analysis,
      analysis, // 100% backward compatibility with existing frontend
      requirement: saved,
      metadata: {
        analysis_id: savedAnalysis.id,
        requirement_id: saved.id,
        project_id: targetProjectId,
        quality_score: analysis.quality_score.overall,
        risk_level: analysis.risk_assessment.risk_level,
        created_at: savedAnalysis.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Get Saved Analyses
 */
exports.getAnalyses = (req, res, next) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { project_id: projectId } : null;
    const analyses = db.find('requirement_analyses', filter, { created_at: 'desc' });
    res.json({ success: true, count: analyses.length, analyses });
  } catch (err) {
    next(err);
  }
};

/**
 * 6. Get Single Analysis by ID
 */
exports.getAnalysisById = (req, res, next) => {
  try {
    const analysis = db.findById('requirement_analyses', req.params.id);
    if (!analysis) {
      // Fallback: check if id is a requirement id
      const reqRecord = db.findById('requirements', req.params.id);
      if (reqRecord && reqRecord.analysis_result) {
        return res.json({
          success: true,
          analysis: {
            id: `ANL-${reqRecord.id}`,
            requirement_id: reqRecord.id,
            title: reqRecord.title,
            analysis_data: reqRecord.analysis_result,
            created_at: reqRecord.created_at
          }
        });
      }
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Analysis record not found.' });
    }
    res.json({ success: true, analysis });
  } catch (err) {
    next(err);
  }
};

/**
 * 7. Delete Analysis
 */
exports.deleteAnalysis = (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = db.remove('requirement_analyses', id);
    if (!removed) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Analysis not found.' });
    }
    res.json({ success: true, message: 'Analysis record deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * 8. Export Analysis (Markdown or JSON)
 */
exports.exportAnalysis = (req, res, next) => {
  try {
    const { id } = req.params;
    const { format = 'markdown' } = req.query;
    const record = db.findById('requirement_analyses', id) || db.findById('requirements', id);
    if (!record) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Analysis record not found for export.' });
    }

    const analysis = record.analysis_data || record.analysis_result;
    if (!analysis) {
      return res.status(404).json({ error: 'NO_ANALYSIS_DATA', message: 'No analysis data found for this record.' });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${record.id}-analysis.json"`);
      return res.send(JSON.stringify(analysis, null, 2));
    }

    // Markdown format
    const markdown = `# Inspectron QA Intelligence Report
**Title:** ${record.title || 'Requirement Analysis'}
**Requirement ID:** ${record.requirement_id || record.id}
**Quality Score:** ${analysis.quality_score?.overall || 85}/100
**Risk Level:** ${analysis.risk_assessment?.risk_level || 'MEDIUM'} (${analysis.risk_assessment?.overall_score || 45}/100)
**Generated:** ${record.created_at || new Date().toISOString()}

---

## 1. Executive Summary
${analysis.summary || 'N/A'}

## 2. Actors & Target Roles
${(analysis.actors || []).map(a => `- ${a}`).join('\n')}

## 3. Preconditions
${(analysis.preconditions || []).map(p => `- ${p}`).join('\n')}

## 4. Business Rules
${(analysis.business_rules || []).map(b => `- ${b}`).join('\n')}

## 5. Acceptance Criteria
${(analysis.acceptance_criteria || []).map(ac => `- ${ac}`).join('\n')}

## 6. Ambiguities & Clarifications Needed
${(analysis.ambiguities || []).map(amb => `- ${typeof amb === 'object' ? `${amb.severity ? `[${amb.severity}] ` : ''}${amb.statement}: ${amb.issue}` : amb}`).join('\n')}

## 7. Hidden Risks & Mitigations
${(analysis.risks || []).map(r => `- ${typeof r === 'object' ? `[${r.category}] ${r.severity}: ${r.risk}. Mitigation: ${r.mitigation}` : r}`).join('\n')}

## 8. QA Test Scenarios
${(analysis.test_scenarios || []).map(ts => `- [${ts.type}] ${ts.title} -> Expected: ${ts.expected_result}`).join('\n')}

## 9. Edge Cases
${(analysis.edge_cases || []).map(ec => `- [${ec.risk_level || 'MED'}] ${ec.case} (Trigger: ${ec.trigger})`).join('\n')}

## 10. System Dependencies
${(analysis.dependencies || []).map(d => `- ${d}`).join('\n')}
`;

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${record.id}-analysis.md"`);
    res.send(markdown);
  } catch (err) {
    next(err);
  }
};

/**
 * 9. Update Requirement
 */
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

/**
 * 10. Delete Requirement
 */
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

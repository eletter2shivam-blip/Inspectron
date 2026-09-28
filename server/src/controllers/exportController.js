const db = require('../db/database');
const exportService = require('../services/ExportService');
const automationExporter = require('../services/AutomationExporter');

exports.exportTestCases = (req, res, next) => {
  try {
    const { format = 'xlsx', projectId, module, requirementId } = req.query;

    const filterFn = (tc) => {
      if (projectId && tc.project_id !== projectId) return false;
      if (module && tc.module !== module) return false;
      if (requirementId && tc.requirement_id !== requirementId) return false;
      return true;
    };

    const testCases = db.find('test_cases', filterFn, { test_case_id: 'asc' });

    if (format === 'xlsx' || format === 'excel') {
      const buffer = exportService.exportTestCasesToExcel(testCases);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="AI_QA_Assistant_Test_Cases_${Date.now()}.xlsx"`);
      return res.send(buffer);
    } else if (format === 'csv') {
      const csv = exportService.exportTestCasesToCSV(testCases);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="AI_QA_Assistant_Test_Cases_${Date.now()}.csv"`);
      return res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="AI_QA_Assistant_Test_Cases_${Date.now()}.json"`);
      return res.send(JSON.stringify(testCases, null, 2));
    }
  } catch (err) {
    next(err);
  }
};

exports.generateAutomationScript = (req, res, next) => {
  try {
    const { testCaseId, framework = 'playwright' } = req.body;
    const tc = db.findById('test_cases', testCaseId);
    if (!tc) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Test case not found.' });
    }

    let code = '';
    let language = 'typescript';

    if (framework === 'selenium' || framework === 'selenium-java') {
      code = automationExporter.generateSeleniumJava(tc);
      language = 'java';
    } else if (framework === 'cypress') {
      code = automationExporter.generateCypress(tc);
      language = 'javascript';
    } else {
      code = automationExporter.generatePlaywright(tc);
      language = 'typescript';
    }

    res.json({
      success: true,
      test_case_id: tc.test_case_id || tc.id,
      framework,
      language,
      script: code
    });
  } catch (err) {
    next(err);
  }
};

const db = require('../db/database');
const aiService = require('../ai/AIService');
const exportService = require('../services/ExportService');

exports.getTestDataSets = (req, res, next) => {
  try {
    const { projectId } = req.query;
    const sets = db.find('test_data_sets', projectId ? { project_id: projectId } : null, { created_at: 'desc' });
    res.json({ success: true, test_data_sets: sets });
  } catch (err) {
    next(err);
  }
};

exports.generateTestData = async (req, res, next) => {
  try {
    const {
      project_id = 'proj-cmgalaxy-01',
      field_name = 'email',
      data_type = 'Email',
      format = 'RFC Compliant',
      quantity = 10,
      business_rules = 'Standard validation',
      save_as_dataset = true
    } = req.body;

    const count = parseInt(quantity, 10) || 10;
    const clampedCount = Math.min(500, Math.max(1, count));

    const spec = {
      projectId: project_id,
      field_name,
      data_type,
      format,
      quantity: clampedCount,
      business_rules
    };

    const aiResult = await aiService.generateTestData(spec, req.user);
    const records = aiResult.records || [];

    let saved = null;
    if (save_as_dataset && records.length > 0) {
      saved = db.insert('test_data_sets', {
        project_id,
        name: `${data_type} Test Data Set (${clampedCount} records)`,
        field_name,
        data_type,
        format,
        quantity: clampedCount,
        records
      });
    }

    res.json({
      success: true,
      field_name,
      data_type,
      quantity: records.length,
      records,
      dataset_id: saved?.id
    });
  } catch (err) {
    next(err);
  }
};

exports.exportTestData = (req, res, next) => {
  try {
    const { format = 'csv', datasetId } = req.query;
    let records = [];
    let fieldName = 'test_data';

    if (datasetId) {
      const ds = db.findById('test_data_sets', datasetId);
      if (ds) {
        records = ds.records || [];
        fieldName = ds.field_name || 'test_data';
      }
    }

    if (records.length === 0) {
      const latest = db.find('test_data_sets', null, { created_at: 'desc' })[0];
      if (latest) {
        records = latest.records;
        fieldName = latest.field_name;
      }
    }

    if (format === 'xlsx' || format === 'excel') {
      const buffer = exportService.exportTestDataToExcel(records, fieldName);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fieldName}_test_data.xlsx"`);
      return res.send(buffer);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${fieldName}_test_data.json"`);
      return res.send(JSON.stringify(records, null, 2));
    } else {
      const csv = exportService.exportTestDataToCSV(records);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fieldName}_test_data.csv"`);
      return res.send(csv);
    }
  } catch (err) {
    next(err);
  }
};

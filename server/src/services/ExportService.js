const XLSX = require('xlsx');

class ExportService {
  /**
   * Export Test Cases to Excel (.xlsx buffer)
   * Required columns: Test Case ID, Requirement ID, Module, Feature, Scenario,
   * Title, Preconditions, Test Data, Steps, Expected Result, Priority, Test Type, Automation Candidate, Status
   */
  exportTestCasesToExcel(testCases = []) {
    const rows = testCases.map(tc => ({
      'Test Case ID': tc.test_case_id || tc.id,
      'Requirement ID': tc.requirement_id || '',
      'Module': tc.module || '',
      'Feature': tc.feature || '',
      'Scenario': tc.scenario || '',
      'Title': tc.title || '',
      'Preconditions': tc.preconditions || '',
      'Test Data': tc.test_data || '',
      'Steps': Array.isArray(tc.steps) ? tc.steps.join('\n') : (tc.steps || ''),
      'Expected Result': tc.expected_result || '',
      'Priority': tc.priority || 'P2-High',
      'Test Type': tc.test_type || 'Functional',
      'Automation Candidate': tc.automation_candidate ? 'Yes' : 'No',
      'Status': tc.status || 'Draft'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-fit column widths
    const colWidths = [
      { wch: 15 }, // ID
      { wch: 18 }, // Req ID
      { wch: 16 }, // Module
      { wch: 20 }, // Feature
      { wch: 28 }, // Scenario
      { wch: 35 }, // Title
      { wch: 28 }, // Preconditions
      { wch: 24 }, // Test Data
      { wch: 45 }, // Steps
      { wch: 40 }, // Expected Result
      { wch: 12 }, // Priority
      { wch: 14 }, // Test Type
      { wch: 12 }, // Automation
      { wch: 12 }  // Status
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Cases');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Export Test Cases to CSV string
   */
  exportTestCasesToCSV(testCases = []) {
    const headers = [
      'Test Case ID',
      'Requirement ID',
      'Module',
      'Feature',
      'Scenario',
      'Title',
      'Preconditions',
      'Test Data',
      'Steps',
      'Expected Result',
      'Priority',
      'Test Type',
      'Automation Candidate',
      'Status'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [headers.map(escapeCsv).join(',')];

    testCases.forEach(tc => {
      const stepsStr = Array.isArray(tc.steps) ? tc.steps.join(' | ') : String(tc.steps || '');
      const row = [
        escapeCsv(tc.test_case_id || tc.id),
        escapeCsv(tc.requirement_id || ''),
        escapeCsv(tc.module || ''),
        escapeCsv(tc.feature || ''),
        escapeCsv(tc.scenario || ''),
        escapeCsv(tc.title || ''),
        escapeCsv(tc.preconditions || ''),
        escapeCsv(tc.test_data || ''),
        escapeCsv(stepsStr),
        escapeCsv(tc.expected_result || ''),
        escapeCsv(tc.priority || 'P2-High'),
        escapeCsv(tc.test_type || 'Functional'),
        escapeCsv(tc.automation_candidate ? 'Yes' : 'No'),
        escapeCsv(tc.status || 'Draft')
      ];
      csvLines.push(row.join(','));
    });

    return csvLines.join('\r\n');
  }

  /**
   * Export Test Data to Excel
   */
  exportTestDataToExcel(records = [], fieldName = 'data') {
    const rows = records.map(r => ({
      'Record #': r.id || '',
      'Type': r.type || 'valid',
      'Value': typeof r.value === 'object' ? JSON.stringify(r.value) : String(r.value),
      'Notes': r.note || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, fieldName);

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Export Test Data to CSV
   */
  exportTestDataToCSV(records = []) {
    const headers = ['Record #', 'Type', 'Value', 'Notes'];
    const escapeCsv = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

    const lines = [headers.join(',')];
    records.forEach(r => {
      const val = typeof r.value === 'object' ? JSON.stringify(r.value) : String(r.value);
      lines.push([
        escapeCsv(r.id),
        escapeCsv(r.type),
        escapeCsv(val),
        escapeCsv(r.note)
      ].join(','));
    });
    return lines.join('\r\n');
  }
}

module.exports = new ExportService();

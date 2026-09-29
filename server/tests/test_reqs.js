const path = require('path');

async function runTest() {
  console.log('Testing Requirements Analyzer Endpoints...');
  
  const reqController = require('../src/controllers/requirementController');

  // 1. Test getSamples
  let samplesData = null;
  const mockRes1 = {
    json: (data) => { samplesData = data; }
  };
  reqController.getSamples({}, mockRes1, (err) => { if (err) throw err; });
  console.log('Samples count:', samplesData?.samples?.length);
  if (!samplesData?.samples || samplesData.samples.length < 3) {
    throw new Error('Samples failed');
  }

  // 2. Test analyzeRequirement
  let analyzeData = null;
  const mockReq2 = {
    body: {
      requirement_text: 'As a user, I want to reset my password using my email so that I can regain access. Link expires in 15 minutes, 3 requests per hour max.',
      title: 'User Story: Password Reset Flow',
      project_id: 'proj-inspectron-01'
    },
    user: { id: 'usr-lead-01', name: 'Sarah Connor', role: 'qa_lead' }
  };
  const mockRes2 = {
    status: (code) => mockRes2,
    json: (data) => { analyzeData = data; }
  };

  await reqController.analyzeRequirement(mockReq2, mockRes2, (err) => {
    if (err) throw err;
  });

  console.log('Analyze success:', analyzeData?.success);
  console.log('Requirement ID:', analyzeData?.requirement_id);
  console.log('Quality Score:', analyzeData?.data?.quality_score?.overall);
  console.log('Risk Level:', analyzeData?.data?.risk_assessment?.risk_level);
  console.log('AC Count:', analyzeData?.data?.acceptance_criteria?.length);
  console.log('Edge Cases:', analyzeData?.data?.edge_cases?.length);
  console.log('Scenarios:', analyzeData?.data?.test_scenarios?.length);
  console.log('Ambiguities:', analyzeData?.data?.ambiguities?.length);

  if (!analyzeData?.data?.quality_score || !analyzeData?.data?.acceptance_criteria) {
    throw new Error('Analyze output incomplete');
  }

  // 3. Test getAnalyses
  let listData = null;
  const mockRes3 = {
    json: (data) => { listData = data; }
  };
  reqController.getAnalyses({ query: {} }, mockRes3, (err) => { if (err) throw err; });
  console.log('Total saved analyses:', listData?.count);

  console.log('ALL REQUIREMENTS ANALYZER TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

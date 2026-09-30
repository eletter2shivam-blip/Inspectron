const pretureController = require('../src/controllers/pretureController');

async function testPreture() {
  console.log('Testing Preture Dashboard Controller Endpoints...');

  const mockRes = (label) => {
    let captured = null;
    return {
      json: (data) => {
        captured = data;
        return data;
      },
      setHeader: () => {},
      send: (data) => {
        captured = data;
        return data;
      },
      getData: () => captured
    };
  };

  // 1. Filters
  const res1 = mockRes('filters');
  pretureController.getFilters({}, res1, console.error);
  const filtersData = res1.getData();
  console.log('Filters count: Stores =', filtersData.stores?.length, ', Cities =', filtersData.cities?.length);
  if (!filtersData.stores || filtersData.stores.length < 5) throw new Error('Filters failed');

  // 2. Summary
  const res2 = mockRes('summary');
  pretureController.getSummary({ query: {} }, res2, console.error);
  const summaryData = res2.getData();
  console.log('Summary: Total Clients =', summaryData.total_clients, ', Total Sales =', summaryData.total_sales_formatted);
  if (summaryData.total_clients !== 12486) throw new Error('Summary benchmark mismatch');

  // 3. Insights
  const res3 = mockRes('insights');
  pretureController.getInsights({ query: {} }, res3, console.error);
  const insightsData = res3.getData();
  console.log('Insights: Momentum =', insightsData.sales_momentum, '%, Top Store =', insightsData.top_store, ', Repeat Rate =', insightsData.repeat_rate, '%');
  if (insightsData.top_store !== 'Mumbai Central') throw new Error('Insights mismatch');

  // 4. Sales Trend
  const res4 = mockRes('sales-trend');
  pretureController.getSalesTrend({ query: {} }, res4, console.error);
  const trendData = res4.getData();
  console.log('Sales Trend data points:', trendData.data?.length);
  if (trendData.data?.length !== 12) throw new Error('Trend data mismatch');

  // 5. Store Performance
  const res5 = mockRes('store-performance');
  pretureController.getStorePerformance({ query: {} }, res5, console.error);
  const perfData = res5.getData();
  console.log('Store performance ranked count:', perfData.stores?.length);
  console.log('Top store in rank:', perfData.stores[0]?.store_name, perfData.stores[0]?.percentage, '%');

  // 6. Billing
  const res6 = mockRes('billing');
  pretureController.getBilling({ query: {} }, res6, console.error);
  const billingData = res6.getData();
  console.log('Billing: Collection =', billingData.payment_collection_rate, '%, Paid =', billingData.paid_bills_count, ', Return =', billingData.return_sales_count);

  // 7. Recent Sales
  const res7 = mockRes('recent-sales');
  pretureController.getRecentSales({ query: { page: 1, limit: 10 } }, res7, console.error);
  const salesData = res7.getData();
  console.log('Recent Sales: Range =', salesData.current_range, ', Records in page =', salesData.transactions?.length);
  if (!salesData.transactions || salesData.transactions.length !== 10) throw new Error('Recent sales page failed');

  // 8. CSV Export
  const res8 = mockRes('export-csv');
  pretureController.exportCsv({ query: {} }, res8, console.error);
  const csvData = res8.getData();
  console.log('CSV Lines count:', csvData.split('\n').length);
  if (!csvData.startsWith('Bill Date,Bill Number')) throw new Error('CSV header mismatch');

  console.log('ALL 8 PRETURE DASHBOARD BACKEND TESTS PASSED!');
  process.exit(0);
}

testPreture().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

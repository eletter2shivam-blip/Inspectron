/**
 * Preture Dashboard Mock & Seed Database
 * Contains realistic enterprise retail and store performance data
 * adhering to all specifications in the Preture PRD.
 */

const STORES = [
  { store_id: 'STR-MUM-01', store_name: 'Mumbai Central', city: 'Mumbai', target_sales: 6500000 },
  { store_id: 'STR-BLR-02', store_name: 'Bengaluru Tech Park', city: 'Bengaluru', target_sales: 6200000 },
  { store_id: 'STR-DEL-03', store_name: 'Delhi NCR Flagship', city: 'Delhi', target_sales: 5800000 },
  { store_id: 'STR-HYD-04', store_name: 'Hyderabad Cyber City', city: 'Hyderabad', target_sales: 6600000 },
  { store_id: 'STR-PUN-05', store_name: 'Pune High Street', city: 'Pune', target_sales: 3200000 },
  { store_id: 'STR-CHN-06', store_name: 'Chennai Express Mall', city: 'Chennai', target_sales: 4100000 }
];

const CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'];

const USERS = [
  { user_id: 'USR-101', name: 'Rajesh Sharma', role: 'Store Manager', city: 'Mumbai', store_id: 'STR-MUM-01' },
  { user_id: 'USR-102', name: 'Priya Nair', role: 'Senior Sales Lead', city: 'Bengaluru', store_id: 'STR-BLR-02' },
  { user_id: 'USR-103', name: 'Amit Verma', role: 'Store Manager', city: 'Delhi', store_id: 'STR-DEL-03' },
  { user_id: 'USR-104', name: 'Sneha Reddy', role: 'Sales Lead', city: 'Hyderabad', store_id: 'STR-HYD-04' },
  { user_id: 'USR-105', name: 'Rohan Deshmukh', role: 'Sales Executive', city: 'Pune', store_id: 'STR-PUN-05' },
  { user_id: 'USR-106', name: 'Ananya Iyer', role: 'Store Manager', city: 'Chennai', store_id: 'STR-CHN-06' }
];

const CLIENT_NAMES = [
  'Arun Patel', 'Meera Kapoor', 'Kavita Joshi', 'Suresh Kumar', 'Vikram Malhotra',
  'Deepa Sundaram', 'Gaurav Singhal', 'Pooja Bhatt', 'Manish Gupta', 'Swati Deshpande',
  'Nikhil Rao', 'Sunita Saxena', 'Karan Mehra', 'Divya Pillai', 'Ramesh Yadav',
  'Bhavna Chawla', 'Siddharth Roy', 'Neha Agarwal', 'Harish Nair', 'Tanya Bajaj',
  'Alok Mukherjee', 'Preeti Kulkarni', 'Aditya Sen', 'Ritu Chopra', 'Kunal Shah',
  'Shalini Menon', 'Farhan Khan', 'Aishwarya R', 'Varun Dhawan', 'Jyoti Mishra'
];

/**
 * Deterministic pseudo-random generator so data stays consistent across server restarts
 */
function createSeededRandom(seed = 42) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Generate 600 realistic transactions throughout the year 2026
 */
function generateTransactions() {
  const random = createSeededRandom(1337);
  const transactions = [];

  const startTimestamp = new Date('2026-01-01T09:00:00Z').getTime();
  const endTimestamp = new Date('2026-12-31T20:00:00Z').getTime();

  for (let i = 1; i <= 600; i++) {
    const timeOffset = Math.floor(random() * (endTimestamp - startTimestamp));
    const billDateObj = new Date(startTimestamp + timeOffset);
    const billDate = billDateObj.toISOString().split('T')[0];

    const store = STORES[Math.floor(random() * STORES.length)];
    const matchingUsers = USERS.filter(u => u.store_id === store.store_id);
    const user = matchingUsers[0] || USERS[Math.floor(random() * USERS.length)];
    const clientName = CLIENT_NAMES[Math.floor(random() * CLIENT_NAMES.length)];
    const clientId = `CLI-${(Math.floor(random() * 400) + 1).toString().padStart(4, '0')}`;

    // Item quantity: 1 to 12
    const quantity = Math.floor(random() * 8) + 1;
    // Unit price between ₹800 and ₹9,500
    const unitPrice = Math.floor(random() * 87) * 100 + 800;
    const amount = quantity * unitPrice;

    // Determine status (Paid: ~78%, Returned: ~14%, Pending: ~8%)
    const statusRoll = random();
    let paymentStatus = 'Paid';
    let returnQuantity = 0;
    let returnAmount = 0;
    let returnReason = '';

    if (statusRoll < 0.14) {
      paymentStatus = 'Returned';
      // Partial or full return
      const isFullReturn = random() > 0.4;
      returnQuantity = isFullReturn ? quantity : Math.max(1, Math.floor(quantity / 2));
      returnAmount = returnQuantity * unitPrice;
      const reasons = ['Defective item', 'Size mismatch', 'Changed mind', 'Delayed delivery', 'Wrong specification'];
      returnReason = reasons[Math.floor(random() * reasons.length)];
    } else if (statusRoll < 0.22) {
      paymentStatus = 'Pending';
    }

    const paymentTypes = ['UPI', 'Credit Card', 'Net Banking', 'Cash'];
    const paymentType = paymentTypes[Math.floor(random() * paymentTypes.length)];

    transactions.push({
      sale_id: `SALE-2026-${String(i).padStart(4, '0')}`,
      bill_no: `BILL-2026-${(i + 8420).toString()}`,
      bill_date: billDate,
      month: billDateObj.toLocaleString('en-US', { month: 'short' }),
      month_index: billDateObj.getMonth(), // 0 - 11
      client_id: clientId,
      client_name: clientName,
      store_id: store.store_id,
      store_name: store.store_name,
      city: store.city,
      user_id: user.user_id,
      user_name: user.name,
      quantity,
      amount,
      payment_status: paymentStatus,
      payment_type: paymentType,
      sale_status: paymentStatus === 'Returned' ? 'Refunded' : 'Completed',
      return_quantity: returnQuantity,
      return_amount: returnAmount,
      return_reason: returnReason
    });
  }

  // Sort by date desc
  return transactions.sort((a, b) => new Date(b.bill_date) - new Date(a.bill_date));
}

const TRANSACTIONS = generateTransactions();

module.exports = {
  STORES,
  CITIES,
  USERS,
  TRANSACTIONS
};

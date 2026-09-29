const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BUNDLED_DATA_DIR = path.join(__dirname, '../../data');
const BUNDLED_DB_FILE = path.join(BUNDLED_DATA_DIR, 'db.json');

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : BUNDLED_DATA_DIR;
const DB_FILE = process.env.VERCEL ? path.join(DATA_DIR, 'db.json') : BUNDLED_DB_FILE;

// Full normalized enterprise schema covering all 42+ required entities
const INITIAL_SCHEMA = {
  // Identity & Access
  users: [],
  roles: [],
  permissions: [],
  user_sessions: [],

  // Projects & Multi-tenancy
  projects: [],
  project_members: [],
  environments: [],

  // Requirements & Analysis
  requirements: [],
  requirement_analyses: [],

  // Test Case Management & Versioning
  test_cases: [],
  test_case_versions: [],
  test_suites: [],
  test_executions: [],
  test_execution_results: [],
  test_steps: [],

  // Regression
  regression_analyses: [],
  regression_tests: [],

  // API Testing & Execution
  api_projects: [],
  api_collections: [],
  api_requests: [],
  api_test_cases: [],
  api_executions: [],

  // Edge Cases & Bugs
  edge_cases: [],
  bugs: [],
  bug_analyses: [],

  // Synthetic Test Data
  test_data_sets: [],
  test_data_records: [],

  // Traceability & Coverage
  coverage_reports: [],
  coverage_items: [],
  coverage_records: [], // backward-compatibility

  // AI Orchestration & Job Queue
  ai_generation_jobs: [],
  ai_generation_results: [],
  ai_prompts: [],
  ai_models: [],
  ai_usage: [],
  ai_generations: [], // backward-compatibility

  // Governance, Logs & Security
  activity_logs: [],
  audit_logs: [],
  notifications: [],
  attachments: [],
  integrations: [],
  secrets: [],
  tags: [],

  // Integrations & Legacy Config
  jira_connections: [],
  jira_issues: [],
  jira_configs: [],
  prompt_versions: [],
  app_settings: []
};

class NormalizedDatabase {
  constructor() {
    this.data = { ...INITIAL_SCHEMA };
    this.indexes = new Map(); // Index map: "collectionName:field" -> Map(val, Set(itemIds))
    this.initialized = false;
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Error creating DATA_DIR:', err);
      }
    }

    // On Vercel, copy bundled db.json to /tmp if not already copied
    if (process.env.VERCEL && !fs.existsSync(DB_FILE) && fs.existsSync(BUNDLED_DB_FILE)) {
      try {
        fs.copyFileSync(BUNDLED_DB_FILE, DB_FILE);
      } catch (e) {
        console.error('Error copying seed db to /tmp:', e);
      }
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...INITIAL_SCHEMA, ...parsed };
      } catch (err) {
        console.error('Error loading db.json, creating backup and re-initializing:', err);
        const backupFile = path.join(DATA_DIR, `db.backup.${Date.now()}.json`);
        try { fs.copyFileSync(DB_FILE, backupFile); } catch (e) {}
        this.persist();
      }
    } else {
      this.persist();
    }
    this.buildIndexes();
    this.initialized = true;
  }

  buildIndexes() {
    this.indexes.clear();
    const indexedFields = ['project_id', 'requirement_id', 'test_case_id', 'status', 'user_id'];
    for (const [colName, items] of Object.entries(this.data)) {
      if (!Array.isArray(items)) continue;
      for (const field of indexedFields) {
        const indexKey = `${colName}:${field}`;
        const map = new Map();
        for (const item of items) {
          if (item[field] !== undefined) {
            const val = String(item[field]);
            if (!map.has(val)) map.set(val, new Set());
            map.get(val).add(item.id);
          }
        }
        this.indexes.set(indexKey, map);
      }
    }
  }

  persist() {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (fallbackErr) {
        console.error('Fallback persist failed:', fallbackErr);
      }
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  find(collectionName, filter = null, sort = null, pagination = null) {
    let items = [...this.getCollection(collectionName)];

    // Apply Filter
    if (filter) {
      if (typeof filter === 'function') {
        items = items.filter(filter);
      } else {
        items = items.filter(item => {
          return Object.entries(filter).every(([key, val]) => {
            if (val === undefined || val === null || val === '') return true;
            if (Array.isArray(val)) return val.includes(item[key]);
            if (typeof val === 'string' && val.includes('*')) {
              const regex = new RegExp('^' + val.replace(/\*/g, '.*') + '$', 'i');
              return regex.test(item[key]);
            }
            return item[key] === val;
          });
        });
      }
    }

    // Apply Sort
    if (sort) {
      const [field, direction] = Object.entries(sort)[0] || ['created_at', 'desc'];
      const dirMultiplier = direction === 'desc' ? -1 : 1;
      items.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        if (typeof valA === 'string') return valA.localeCompare(valB) * dirMultiplier;
        return (valA - valB) * dirMultiplier;
      });
    }

    const total = items.length;

    // Apply Pagination
    if (pagination && pagination.page && pagination.limit) {
      const page = Math.max(1, parseInt(pagination.page));
      const limit = Math.max(1, parseInt(pagination.limit));
      const start = (page - 1) * limit;
      const paginatedItems = items.slice(start, start + limit);
      return {
        items: paginatedItems,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    }

    return items;
  }

  findOne(collectionName, filter) {
    const col = this.getCollection(collectionName);
    if (typeof filter === 'function') {
      return col.find(filter) || null;
    }
    return col.find(item => Object.entries(filter).every(([k, v]) => item[k] === v)) || null;
  }

  findById(collectionName, id) {
    const col = this.getCollection(collectionName);
    return col.find(item => item.id === id) || null;
  }

  insert(collectionName, item) {
    const col = this.getCollection(collectionName);
    const now = new Date().toISOString();
    const newItem = {
      id: item.id || `${collectionName.slice(0, 3)}-${uuidv4().slice(0, 8)}`,
      created_at: item.created_at || now,
      updated_at: item.updated_at || now,
      ...item
    };
    col.push(newItem);
    this.persist();
    return newItem;
  }

  insertMany(collectionName, items) {
    const col = this.getCollection(collectionName);
    const now = new Date().toISOString();
    const inserted = items.map(item => ({
      id: item.id || `${collectionName.slice(0, 3)}-${uuidv4().slice(0, 8)}`,
      created_at: item.created_at || now,
      updated_at: item.updated_at || now,
      ...item
    }));
    col.push(...inserted);
    this.persist();
    return inserted;
  }

  update(collectionName, id, updates) {
    const col = this.getCollection(collectionName);
    const idx = col.findIndex(item => item.id === id);
    if (idx === -1) return null;

    col[idx] = {
      ...col[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.persist();
    return col[idx];
  }

  remove(collectionName, id) {
    const col = this.getCollection(collectionName);
    const idx = col.findIndex(item => item.id === id);
    if (idx === -1) return false;

    col.splice(idx, 1);
    this.persist();
    return true;
  }

  removeWhere(collectionName, filter) {
    const col = this.getCollection(collectionName);
    const initialLen = col.length;
    let retained;
    if (typeof filter === 'function') {
      retained = col.filter(item => !filter(item));
    } else {
      retained = col.filter(item => !Object.entries(filter).every(([k, v]) => item[k] === v));
    }
    this.data[collectionName] = retained;
    this.persist();
    return initialLen - retained.length;
  }

  count(collectionName, filter = null) {
    if (!filter) return this.getCollection(collectionName).length;
    return this.find(collectionName, filter).length;
  }

  // Group-by Aggregation Helper
  groupBy(collectionName, field, filter = null) {
    const items = this.find(collectionName, filter);
    const counts = {};
    for (const item of items) {
      const val = item[field] || 'Unknown';
      counts[val] = (counts[val] || 0) + 1;
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }

  // Versioning Helper for Test Cases
  createTestCaseVersion(testCaseId, snapshot, changeSummary = 'Updated test case', userId = null) {
    const versions = this.find('test_case_versions', { test_case_id: testCaseId });
    const nextVersionNumber = versions.length + 1;

    const versionRecord = {
      id: `ver-${uuidv4().slice(0, 8)}`,
      test_case_id: testCaseId,
      version_number: nextVersionNumber,
      snapshot: { ...snapshot },
      change_summary: changeSummary,
      created_by: userId,
      created_at: new Date().toISOString()
    };

    this.insert('test_case_versions', versionRecord);
    this.update('test_cases', testCaseId, { current_version: nextVersionNumber });
    return versionRecord;
  }

  clear() {
    this.data = { ...INITIAL_SCHEMA };
    this.persist();
  }
}

const db = new NormalizedDatabase();
module.exports = db;

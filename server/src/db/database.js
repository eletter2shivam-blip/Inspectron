const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const BUNDLED_DATA_DIR = path.join(__dirname, '../../data');
const BUNDLED_DB_FILE = path.join(BUNDLED_DATA_DIR, 'db.json');

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : BUNDLED_DATA_DIR;
const DB_FILE = process.env.VERCEL ? path.join(DATA_DIR, 'db.json') : BUNDLED_DB_FILE;

// Initial empty schema
const INITIAL_SCHEMA = {
  users: [],
  projects: [],
  requirements: [],
  jira_issues: [],
  jira_configs: [],
  test_cases: [],
  api_tests: [],
  regression_tests: [],
  bugs: [],
  test_data_sets: [],
  coverage_records: [],
  ai_generations: [],
  prompt_versions: [],
  audit_logs: [],
  app_settings: []
};

class JSONDatabase {
  constructor() {
    this.data = { ...INITIAL_SCHEMA };
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
    this.initialized = true;
  }

  persist() {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
      // Fallback direct write
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (fallbackErr) {
        console.error('Fallback persist failed:', fallbackErr);
      }
    }
  }

  // Repository methods
  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  find(collectionName, filter = null, sort = null, pagination = null) {
    let items = [...this.getCollection(collectionName)];

    if (typeof filter === 'function') {
      items = items.filter(filter);
    } else if (filter && typeof filter === 'object') {
      items = items.filter(item => {
        return Object.entries(filter).every(([k, v]) => item[k] === v);
      });
    }

    if (sort && typeof sort === 'object') {
      const [field, direction] = Object.entries(sort)[0];
      const factor = direction === 'desc' || direction === -1 ? -1 : 1;
      items.sort((a, b) => {
        if (a[field] < b[field]) return -1 * factor;
        if (a[field] > b[field]) return 1 * factor;
        return 0;
      });
    }

    const total = items.length;

    if (pagination && pagination.page && pagination.limit) {
      const skip = (pagination.page - 1) * pagination.limit;
      items = items.slice(skip, skip + pagination.limit);
      return { items, total, page: pagination.page, limit: pagination.limit };
    }

    return items;
  }

  findOne(collectionName, filter) {
    const col = this.getCollection(collectionName);
    if (typeof filter === 'function') {
      return col.find(filter) || null;
    }
    if (filter && typeof filter === 'object') {
      return col.find(item => Object.entries(filter).every(([k, v]) => item[k] === v)) || null;
    }
    return null;
  }

  findById(collectionName, id) {
    const col = this.getCollection(collectionName);
    return col.find(item => item.id === id) || null;
  }

  insert(collectionName, doc) {
    const col = this.getCollection(collectionName);
    const newDoc = {
      id: doc.id || uuidv4(),
      ...doc,
      created_at: doc.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    col.push(newDoc);
    this.persist();
    return newDoc;
  }

  insertMany(collectionName, docs) {
    const col = this.getCollection(collectionName);
    const created = docs.map(doc => ({
      id: doc.id || uuidv4(),
      ...doc,
      created_at: doc.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    col.push(...created);
    this.persist();
    return created;
  }

  update(collectionName, id, partialDoc) {
    const col = this.getCollection(collectionName);
    const idx = col.findIndex(item => item.id === id);
    if (idx === -1) return null;

    col[idx] = {
      ...col[idx],
      ...partialDoc,
      id: col[idx].id, // Prevent overwriting ID
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

  clear() {
    this.data = { ...INITIAL_SCHEMA };
    this.persist();
  }
}

const db = new JSONDatabase();
module.exports = db;

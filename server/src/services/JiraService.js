const https = require('https');
const http = require('http');
const db = require('../db/database');

class JiraService {
  /**
   * Save Jira credentials securely (token masked in client responses)
   */
  saveConfig(projectId, config) {
    const existing = db.findOne('jira_configs', { project_id: projectId });
    const masked = config.api_token ? `••••••••••••${config.api_token.slice(-4)}` : (existing?.api_token_masked || '');

    const record = {
      project_id: projectId,
      jira_url: (config.jira_url || '').replace(/\/+$/, ''),
      username: config.username || '',
      api_token_raw: config.api_token || (existing ? existing.api_token_raw : ''),
      api_token_masked: masked,
      project_key: (config.project_key || 'CMG').toUpperCase(),
      connected: true,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      db.update('jira_configs', existing.id, record);
    } else {
      db.insert('jira_configs', record);
    }

    return {
      jira_url: record.jira_url,
      username: record.username,
      api_token_masked: record.api_token_masked,
      project_key: record.project_key,
      connected: record.connected
    };
  }

  getConfig(projectId) {
    const cfg = db.findOne('jira_configs', { project_id: projectId });
    if (!cfg) {
      return {
        jira_url: 'https://inspectron.atlassian.net',
        username: 'qa-automation@inspectron.io',
        api_token_masked: '••••••••••••3a9F',
        project_key: 'CMG',
        connected: true
      };
    }
    return {
      jira_url: cfg.jira_url,
      username: cfg.username,
      api_token_masked: cfg.api_token_masked,
      project_key: cfg.project_key,
      connected: cfg.connected
    };
  }

  /**
   * Search and fetch issues (Live Jira Cloud REST API or Demo Mock if unavailable)
   */
  async searchIssues(projectId, query = '') {
    const cfg = db.findOne('jira_configs', { project_id: projectId });
    
    // Check if user has connected a real live Jira domain
    if (cfg && cfg.jira_url && cfg.username && cfg.api_token_raw && !cfg.jira_url.includes('example.com') && !cfg.jira_url.includes('inspectron.atlassian.net')) {
      try {
        return await this.fetchLiveJiraIssues(cfg, query);
      } catch (err) {
        console.warn('Live Jira connection failed, falling back to cached/demo issues:', err.message);
      }
    }

    // Return stored / demo Jira issues
    let issues = db.find('jira_issues', { project_id: projectId });
    if (issues.length === 0) {
      // Return default Inspectron issues
      issues = [
        {
          id: 'jira-cmg-104',
          project_id: projectId,
          issue_key: 'CMG-104',
          summary: 'Implement secure self-service password reset flow with 15min expiry',
          description: 'We need to implement a secure password reset flow using single-use 15min tokens as outlined in Security PRD v2. Rate limiting must prevent brute-force attacks.',
          acceptance_criteria: '1. User receives email with token within 60s\n2. Token expires after 15 minutes\n3. Token is invalidated on first use\n4. Password complexity strictly enforced\n5. Max 3 requests/hour per email',
          comments: [
            { author: 'alex.sdet', body: 'Please ensure we handle user enumeration prevention with constant-time response.' }
          ],
          labels: ['security', 'auth', 'release-2.4', 'backend'],
          priority: 'High',
          components: ['Auth Service', 'Mailer Service'],
          status: 'In Progress'
        },
        {
          id: 'jira-cmg-105',
          project_id: projectId,
          issue_key: 'CMG-105',
          summary: 'Omnichannel Campaign Builder: Simultaneous Google Ads & Meta Ads sync',
          description: 'Allow agency marketing manager to configure budget, audience targeting, and ad creative in one unified UI and push to Google Ads and Meta Ads Manager with rollback support.',
          acceptance_criteria: '1. Campaign created on both platforms simultaneously\n2. Validation errors on one platform trigger rollback or partial-success alert\n3. Daily budget minimum $5.00',
          comments: [
            { author: 'product.owner', body: 'High priority for Q3 enterprise marketing release.' }
          ],
          labels: ['campaign', 'google-ads', 'meta-ads', 'integrations'],
          priority: 'Highest',
          components: ['Campaign Service', 'Google Ads Connector', 'Meta Ads Connector'],
          status: 'To Do'
        },
        {
          id: 'jira-cmg-106',
          project_id: projectId,
          issue_key: 'CMG-106',
          summary: 'Real-time Conversion Funnel Chart and Attribution Dropoff Analytics',
          description: 'Render interactive multi-stage funnel dropoff charts displaying conversion rates between Impression -> Click -> Signup -> Paid Subscription with date filtering.',
          acceptance_criteria: '1. Renders 4-stage funnel\n2. Date range selector (Last 7d, 30d, 90d)\n3. Export report to CSV/Excel',
          comments: [],
          labels: ['analytics', 'reporting', 'charts'],
          priority: 'Medium',
          components: ['Dashboard', 'Reports Engine'],
          status: 'Under Review'
        }
      ];
    }

    if (query && query.trim().length > 0) {
      const q = query.toLowerCase();
      return issues.filter(iss =>
        iss.issue_key.toLowerCase().includes(q) ||
        iss.summary.toLowerCase().includes(q) ||
        iss.description.toLowerCase().includes(q)
      );
    }

    return issues;
  }

  /**
   * Fetch specific Jira issue details
   */
  async getIssue(projectId, issueKey) {
    const issues = await this.searchIssues(projectId);
    const found = issues.find(i => i.issue_key === issueKey || i.id === issueKey);
    if (!found) {
      throw new Error(`Jira issue ${issueKey} not found.`);
    }
    return found;
  }

  /**
   * Fetch live from Atlassian Jira Cloud REST API v3
   */
  async fetchLiveJiraIssues(cfg, query) {
    const jql = query ? `text ~ "${query}" ORDER BY updated DESC` : `project = "${cfg.project_key}" ORDER BY updated DESC`;
    const url = new URL(`${cfg.jira_url}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=20`);

    const authHeader = 'Basic ' + Buffer.from(`${cfg.username}:${cfg.api_token_raw}`).toString('base64');

    return new Promise((resolve, reject) => {
      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(data);
              const mapped = (parsed.issues || []).map(item => ({
                id: item.id,
                project_id: cfg.project_id,
                issue_key: item.key,
                summary: item.fields.summary,
                description: typeof item.fields.description === 'string' ? item.fields.description : JSON.stringify(item.fields.description),
                acceptance_criteria: item.fields.customfield_10016 || item.fields.description || 'See description',
                comments: (item.fields.comment?.comments || []).map(c => ({ author: c.author?.displayName, body: c.body })),
                labels: item.fields.labels || [],
                priority: item.fields.priority?.name || 'Medium',
                components: (item.fields.components || []).map(c => c.name),
                status: item.fields.status?.name || 'Open'
              }));
              resolve(mapped);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`Jira API returned HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(6000, () => {
        req.destroy(new Error('Jira API request timeout'));
      });
      req.end();
    });
  }
}

module.exports = new JiraService();

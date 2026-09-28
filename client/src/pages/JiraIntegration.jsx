import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import AiProgressBanner from '../components/common/AiProgressBanner';
import {
  Ticket,
  Sparkles,
  Search,
  CheckCircle,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Settings,
  RefreshCw
} from 'lucide-react';

export default function JiraIntegration({ onNavigateToRepository }) {
  const { selectedProjectId } = useProject();
  const toast = useToast();

  const [config, setConfig] = useState({
    jira_url: 'https://cmgalaxy.atlassian.net',
    project_key: 'CMG',
    username: 'qa-automation@cmgalaxy.io',
    api_token_masked: '••••••••••••3a9F',
    connected: true
  });

  const [jiraUrl, setJiraUrl] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [username, setUsername] = useState('');
  const [apiToken, setApiToken] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(true);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/jira/config', { projectId: selectedProjectId });
      if (res.config) {
        setConfig(res.config);
        setJiraUrl(res.config.jira_url || '');
        setProjectKey(res.config.project_key || '');
        setUsername(res.config.username || '');
      }
    } catch (err) {
      console.warn('Failed to load Jira config:', err.message);
    }
  };

  const fetchIssues = async (query = '') => {
    setLoadingIssues(true);
    try {
      const res = await api.get('/jira/issues/search', { projectId: selectedProjectId, query });
      const list = res.issues || [];
      setIssues(list);
      if (list.length > 0 && !selectedIssue) {
        setSelectedIssue(list[0]);
      }
    } catch (err) {
      toast.error('Failed to fetch Jira issues.');
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchIssues();
  }, [selectedProjectId]);

  const handleSaveConfig = async () => {
    try {
      const res = await api.post('/jira/config', {
        projectId: selectedProjectId,
        jira_url: jiraUrl,
        project_key: projectKey,
        username,
        api_token: apiToken
      });
      setConfig(res.config);
      setApiToken('');
      toast.success('Jira credentials updated securely.');
      fetchIssues();
    } catch (err) {
      toast.error('Failed to save Jira configuration.');
    }
  };

  const handleGenerateTests = async (issue) => {
    if (!issue) return;
    setIsGenerating(true);

    try {
      const res = await api.post(`/jira/issues/${issue.issue_key}/generate-tests`, {
        projectId: selectedProjectId,
        auto_save: true
      });

      toast.success(`Generated and saved ${res.count} test cases directly from Jira [${issue.issue_key}]!`);
      if (onNavigateToRepository) {
        onNavigateToRepository();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate test cases from Jira.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
          <Ticket className="w-4 h-4" />
          <span>Atlassian Jira Enterprise Cloud Sync</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
          Jira Integration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Fetch active user stories, parse acceptance criteria, and generate automated test suites with one click.
        </p>
      </div>

      <AiProgressBanner
        isProcessing={isGenerating}
        title={`Extracting Acceptance Criteria & Generating Test Cases from ${selectedIssue?.issue_key || 'Jira Issue'}...`}
      />

      {/* Jira Configuration Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Jira Cloud Status: Connected</span>
            <span className="text-[10px] text-slate-400 font-mono">({config.jira_url})</span>
          </div>

          <span className="text-xs text-slate-400 flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-brand-400" />
            <span>Tokens are masked and encrypted at rest</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Jira Instance URL</label>
            <input
              type="text"
              value={jiraUrl}
              onChange={(e) => setJiraUrl(e.target.value)}
              placeholder="https://yourcompany.atlassian.net"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Project Key</label>
            <input
              type="text"
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
              placeholder="CMG"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Username / Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="qa@domain.com"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">API Token (Secret)</label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder={config.api_token_masked || 'Enter API Token'}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
              <button
                onClick={handleSaveConfig}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold shrink-0"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Issues List on Left, Ticket Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issues List Column */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Ticket className="w-4 h-4 text-blue-400" />
              <span>Jira Issues ({issues.length})</span>
            </h3>
            <button
              onClick={() => fetchIssues(searchQuery)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Refresh Jira Issues"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchIssues(e.target.value);
              }}
              placeholder="Search Jira issues..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
            {loadingIssues ? (
              <div className="text-center p-6 text-xs text-slate-400">Loading Jira issues...</div>
            ) : issues.length === 0 ? (
              <div className="text-center p-6 text-xs text-slate-400">No issues found.</div>
            ) : (
              issues.map((iss) => {
                const isSelected = selectedIssue?.id === iss.id || selectedIssue?.issue_key === iss.issue_key;
                return (
                  <div
                    key={iss.id}
                    onClick={() => setSelectedIssue(iss)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500/80 bg-brand-950/40 shadow-md'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-brand-400">{iss.issue_key}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        iss.priority === 'Highest' || iss.priority === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {iss.priority}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 line-clamp-1">{iss.summary}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Status: {iss.status}</span>
                      <span>{(iss.components || []).join(', ') || 'Core'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Issue Preview & Test Case Generator */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          {selectedIssue ? (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-brand-400 bg-brand-950/60 px-2 py-0.5 rounded border border-brand-500/30">
                      {selectedIssue.issue_key}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Status: {selectedIssue.status}</span>
                    <span className="text-xs text-slate-400 font-mono">Priority: {selectedIssue.priority}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1.5 leading-snug">
                    {selectedIssue.summary}
                  </h2>
                </div>

                <button
                  onClick={() => handleGenerateTests(selectedIssue)}
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating Tests...' : 'Generate Test Cases'}</span>
                </button>
              </div>

              {/* Description */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Description</span>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 leading-relaxed font-mono whitespace-pre-wrap text-[11px]">
                  {selectedIssue.description}
                </div>
              </div>

              {/* Acceptance Criteria */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Acceptance Criteria
                </span>
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-200 leading-relaxed font-mono whitespace-pre-wrap text-[11px]">
                  {selectedIssue.acceptance_criteria}
                </div>
              </div>

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">Components:</span>
                  <div className="flex flex-wrap gap-1">
                    {(selectedIssue.components || ['None']).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">Labels:</span>
                  <div className="flex flex-wrap gap-1">
                    {(selectedIssue.labels || ['None']).map((l, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-brand-300 font-mono text-[11px]">
                        #{l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-12 text-slate-400 text-xs">
              Select a Jira ticket on the left to preview details and generate tests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

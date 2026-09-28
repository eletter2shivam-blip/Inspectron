import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Sparkles,
  Key,
  Shield,
  Layers,
  Cpu,
  History,
  Activity,
  CheckCircle,
  FileCode
} from 'lucide-react';

export default function Settings() {
  const toast = useToast();
  const { user } = useAuth();

  const [aiProvider, setAiProvider] = useState('hybrid');
  const [aiModel, setAiModel] = useState('gemini-3.8-flash');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'prompts' | 'security'

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.settings) {
        setAiProvider(res.settings.ai_provider || 'hybrid');
        setAiModel(res.settings.ai_model || 'gemini-3.8-flash');
        setMaskedKey(res.settings.gemini_api_key_masked || '');
        setIsConfigured(res.settings.gemini_api_key_configured || false);
      }
    } catch (err) {
      console.warn('Failed to load settings:', err.message);
    }
  };

  const fetchPrompts = async () => {
    try {
      const res = await api.get('/prompts');
      const list = res.prompts || [];
      setPrompts(list);
      if (list.length > 0 && !selectedPrompt) {
        setSelectedPrompt(list[0]);
      }
    } catch (err) {
      console.warn('Failed to load prompts:', err.message);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/settings/audit-logs');
      setAuditLogs(res.logs || []);
    } catch (err) {
      console.warn('Failed to load audit logs:', err.message);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchPrompts();
    fetchAuditLogs();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await api.post('/settings', {
        ai_provider: aiProvider,
        ai_model: aiModel,
        gemini_api_key: geminiApiKey || undefined
      });
      toast.success('AI engine and provider settings updated successfully!');
      setGeminiApiKey('');
      fetchSettings();
    } catch (err) {
      toast.error('Failed to update settings.');
    }
  };

  const handleUpdatePrompt = async () => {
    if (!selectedPrompt) return;
    try {
      await api.put(`/prompts/${selectedPrompt.id}`, {
        prompt_template: selectedPrompt.prompt_template,
        is_active: selectedPrompt.is_active
      });
      toast.success(`Prompt version ${selectedPrompt.version} updated.`);
      fetchPrompts();
    } catch (err) {
      toast.error('Failed to update prompt version.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <SettingsIcon className="w-4 h-4 text-brand-400" />
          <span>Platform Governance & Infrastructure</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
          System Settings & AI Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure Google Gemini model parameters, provider abstraction modes, prompt templates, and security audit logs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {[
          { id: 'ai', label: 'AI Provider & Models', icon: Sparkles },
          { id: 'prompts', label: 'Modular Prompt Engine (v1.x)', icon: FileCode },
          { id: 'security', label: 'Security & Audit Logs', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: AI Provider & Models */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Provider Abstraction Layer</h3>
                <p className="text-xs text-slate-400">Section 23: Decoupled AI provider pipeline</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'hybrid',
                  title: 'Hybrid Engine (Recommended)',
                  desc: 'Attempts Google Gemini 3.8 Flash API when available; gracefully falls back to Heuristic QA Engine with zero downtime.',
                  badge: 'Standard'
                },
                {
                  id: 'gemini',
                  title: 'Gemini Cloud Only',
                  desc: 'Direct invocations to Google Gemini 3.8 Flash model. Requires active GEMINI_API_KEY.',
                  badge: 'Direct'
                },
                {
                  id: 'offline',
                  title: 'Heuristic QA Engine (Offline)',
                  desc: 'High-speed deterministic QA domain reasoning engine. Works with zero external network or quota dependencies.',
                  badge: 'Local'
                }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setAiProvider(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    aiProvider === opt.id
                      ? 'border-brand-500 bg-brand-950/30 shadow-lg'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{opt.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Model & API Key row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Primary Model
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended: 1M tokens, Agentic & Fast)</option>
                  <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Ultra Fast Throughput)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Complex QA Reasoning)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Google Gemini API Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder={maskedKey || 'AIzaSy... (leave blank to keep current)'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {isConfigured ? 'API key is securely configured.' : 'No key provided; system operates seamlessly on Heuristic QA Engine.'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all"
              >
                Save AI Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Modular Prompt Engine */}
      {activeTab === 'prompts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Registered Prompt Templates
            </h3>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {prompts.map(p => {
                const isSelected = selectedPrompt?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPrompt(p)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-950/40 text-white'
                        : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{p.feature?.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-brand-300">
                        {p.version}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Active: {p.is_active ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            {selectedPrompt ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-white capitalize">
                      {selectedPrompt.feature?.replace(/_/g, ' ')}
                    </h4>
                    <span className="font-mono text-xs text-brand-400">Version: {selectedPrompt.version}</span>
                  </div>

                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPrompt.is_active}
                      onChange={(e) => setSelectedPrompt({ ...selectedPrompt, is_active: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-brand-500"
                    />
                    <span>Active Version</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Prompt Template Specification
                  </label>
                  <textarea
                    rows={12}
                    value={selectedPrompt.prompt_template}
                    onChange={(e) => setSelectedPrompt({ ...selectedPrompt, prompt_template: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-300 leading-relaxed focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleUpdatePrompt}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30"
                  >
                    Save Prompt Template
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-12 text-xs text-slate-400">
                Select a prompt version on the left to edit.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Security & Audit Logs */}
      {activeTab === 'security' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Immutable Audit Trail ({auditLogs.length} events)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Tracks mutations & security events</span>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 w-36">Timestamp</th>
                  <th className="p-3.5 w-36">Action</th>
                  <th className="p-3.5 w-28">Entity</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5 w-28">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {new Date(log.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-brand-400">
                      {log.action}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {log.entity}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-mono text-[11px] line-clamp-1">
                      {log.details}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {log.user_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

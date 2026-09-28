import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import {
  FolderGit2,
  FileSearch,
  Sparkles,
  GitBranch,
  Network,
  Bug,
  ShieldAlert,
  Percent,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const { selectedProjectId, activeProject } = useProject();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/dashboard/stats', { projectId: selectedProjectId })
      .then(res => setData(res))
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading QA Intelligence Dashboard...</span>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentCases = data?.recentTestCases || [];
  const activities = data?.recentActivities || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-brand-950/80 via-slate-900 to-indigo-950/80 border border-brand-500/20 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous QA Engineering & Generation Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            {activeProject?.name || 'CMGalaxy'} QA Operations
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            AI-powered requirements synthesis, Jira issue decomposition, automated API test design, and regression impact analysis.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('requirements')}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center space-x-2"
            >
              <FileSearch className="w-4 h-4" />
              <span>Analyze New Requirement</span>
            </button>
            <button
              onClick={() => onNavigate('generator')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Generate Test Cases</span>
            </button>
            <button
              onClick={() => onNavigate('jira')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all flex items-center space-x-2"
            >
              <span>Sync Jira Issues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Requirements Analyzed', value: stats.totalRequirements, icon: FileSearch, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Total Test Cases', value: stats.totalTestCases, icon: Sparkles, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Regression Tests', value: stats.regressionTestCases, icon: GitBranch, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'API Scenarios', value: stats.apiTestCases, icon: Network, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Bugs Diagnosed', value: stats.bugsAnalyzed, icon: Bug, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Edge Cases Found', value: stats.edgeCasesIdentified, icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Test Coverage', value: `${stats.testCoveragePercentage}%`, icon: Percent, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Active Projects', value: stats.totalProjects, icon: FolderGit2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-card p-5 rounded-2xl flex items-center justify-between border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-400">{kpi.label}</p>
                <p className="text-2xl font-black text-white mt-1 font-mono">{kpi.value}</p>
              </div>
              <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics / Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Type Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span>Test Type Breakdown</span>
            <span className="text-xs text-slate-400 font-normal">By category</span>
          </h3>
          <div className="space-y-3">
            {(charts.testTypes || []).map((t, idx) => {
              const max = Math.max(...charts.testTypes.map(i => i.count), 1);
              const pct = Math.round((t.count / max) * 100);
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>{t.name}</span>
                    <span className="font-mono text-brand-400">{t.count}</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span>Priority Distribution</span>
            <span className="text-xs text-slate-400 font-normal">Risk alignment</span>
          </h3>
          <div className="space-y-3">
            {(charts.priorities || []).map((p, idx) => {
              let color = 'bg-rose-500';
              if (p.name.includes('High')) color = 'bg-amber-500';
              if (p.name.includes('Medium')) color = 'bg-blue-500';
              if (p.name.includes('Low')) color = 'bg-slate-500';

              const max = Math.max(...charts.priorities.map(i => i.count), 1);
              const pct = Math.round((p.count / max) * 100);

              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>{p.name}</span>
                    <span className="font-mono text-slate-200">{p.count}</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module Coverage Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span>Module Test Volume</span>
            <span className="text-xs text-slate-400 font-normal">Top modules</span>
          </h3>
          <div className="space-y-3">
            {(charts.modules || []).slice(0, 6).map((m, idx) => {
              const max = Math.max(...charts.modules.map(i => i.count), 1);
              const pct = Math.round((m.count / max) * 100);
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>{m.name}</span>
                    <span className="font-mono text-indigo-400">{m.count} tests</span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Test Cases & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Generated Test Cases */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Recently Generated Test Cases</span>
            </h3>
            <button
              onClick={() => onNavigate('repository')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center"
            >
              View Repository <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {recentCases.slice(0, 5).map((tc) => (
              <div
                key={tc.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-brand-400">{tc.test_case_id || tc.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {tc.module}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      tc.priority?.includes('P1') ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {tc.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium line-clamp-1">{tc.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    Score: {tc.quality_score || 95}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Recent Activities & Generation Logs</span>
          </h3>

          <div className="space-y-3">
            {activities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start space-x-3 text-xs"
              >
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{act.action?.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5 line-clamp-1">{act.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

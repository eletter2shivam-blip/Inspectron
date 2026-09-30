import React from 'react';
import {
  LayoutDashboard,
  FileSearch,
  Ticket,
  Sparkles,
  GitBranch,
  Network,
  ShieldAlert,
  Database,
  Bug,
  CheckCircle2,
  FolderGit2,
  History,
  Settings,
  ListTodo
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'requirements', label: 'Requirements Analyzer', icon: FileSearch, badge: 'AI' },
  { id: 'jira', label: 'Jira Integration', icon: Ticket, badge: 'Sync' },
  { id: 'generator', label: 'Test Case Generator', icon: Sparkles, badge: 'Core' },
  { id: 'regression', label: 'Regression Generator', icon: GitBranch, badge: null },
  { id: 'api-tests', label: 'API Test Generator', icon: Network, badge: 'REST' },
  { id: 'edge-cases', label: 'Edge Case Analyzer', icon: ShieldAlert, badge: 'Audit' },
  { id: 'test-data', label: 'Test Data Generator', icon: Database, badge: null },
  { id: 'bugs', label: 'Bug Analyzer', icon: Bug, badge: 'RCA' },
  { id: 'coverage', label: 'Test Coverage', icon: CheckCircle2, badge: 'Matrix' },
  { id: 'repository', label: 'Test Case Repository', icon: ListTodo, badge: null },
  { id: 'projects', label: 'Projects', icon: FolderGit2, badge: null },
  { id: 'history', label: 'AI History', icon: History, badge: null },
  { id: 'settings', label: 'Settings', icon: Settings, badge: null }
];

export default function Sidebar({ activeSection, onSelectSection }) {
  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 bg-slate-950">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/25 border border-brand-400/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wider text-white flex items-center">
              Inspectron <span className="text-brand-400 ml-1 font-semibold">QA</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">AI Quality Platform</div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
          QA Workflows
        </div>
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase font-mono font-bold tracking-wider ${
                    isActive
                      ? 'bg-brand-700 text-white'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">STATUS</span>
            <span className="flex items-center text-[10px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Operational
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium mt-1 truncate">
            Demo: Inspectron Cloud
          </div>
        </div>
      </div>
    </aside>
  );
}

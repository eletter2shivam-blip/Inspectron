import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import {
  FolderGit2,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  Layers,
  ShieldCheck
} from 'lucide-react';

export default function Header({ onQuickAction }) {
  const { projects, activeProject, selectedProjectId, selectProject } = useProject();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="h-16 bg-slate-950/90 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 backdrop-blur-md z-20">
      {/* Left: Project Selector */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
          <FolderGit2 className="w-4 h-4 text-brand-400" />
          <span className="text-xs text-slate-400 font-medium">Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => selectProject(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-2"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                {p.name} ({p.environment || 'Staging'})
              </option>
            ))}
          </select>
        </div>

        {activeProject && (
          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeProject.modules?.length || 0} Modules</span>
          </div>
        )}
      </div>

      {/* Right: AI Engine Status & User Profile */}
      <div className="flex items-center space-x-3">
        {/* AI Status Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-brand-950/40 border border-brand-500/30 text-brand-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
          <span>Gemini 3.8 Flash & Heuristic Core</span>
        </div>

        {/* User Card */}
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-brand-400">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'QA'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white leading-none">{user.name}</div>
              <div className="text-[10px] text-brand-400 font-medium capitalize mt-0.5">{user.role?.replace('_', ' ')}</div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            Guest Mode
          </div>
        )}
      </div>
    </header>
  );
}

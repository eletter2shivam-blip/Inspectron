import React, { useState } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import {
  FolderGit2,
  Plus,
  Layers,
  Sparkles,
  Server,
  Code2,
  Trash2,
  CheckCircle,
  RotateCcw,
  X
} from 'lucide-react';

export default function Projects() {
  const { projects, selectedProjectId, selectProject, refreshProjects } = useProject();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    application_name: '',
    environment: 'Staging / Production',
    technology: 'React, Node.js, PostgreSQL',
    modules: 'Dashboard, Login, Signup, Campaign, Google Ads, Meta Ads, Reports'
  });

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Project Name is required.');
      return;
    }

    try {
      const res = await api.post('/projects', formData);
      toast.success(`Project "${res.project.name}" created successfully!`);
      setModalOpen(false);
      refreshProjects();
    } catch (err) {
      toast.error(err.message || 'Failed to create project.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete project "${name}"?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success(`Project "${name}" deleted.`);
      refreshProjects();
    } catch (err) {
      toast.error('Failed to delete project.');
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo data to fresh CMGalaxy state? This will refresh demo requirements, bugs, and test cases.')) return;
    try {
      await api.post('/projects/reset-demo');
      toast.success('CMGalaxy demo project restored successfully with 12 modules!');
      refreshProjects();
    } catch (err) {
      toast.error('Failed to reset demo data.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <FolderGit2 className="w-4 h-4" />
            <span>Workspace & Application Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Project Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Each project isolates requirements, test cases, bugs, API tests, regression coverage, and history.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetDemo}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand-400" />
            <span>Reset Demo Project</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const isActive = proj.id === selectedProjectId;
          return (
            <div
              key={proj.id}
              className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isActive
                  ? 'border-brand-500/80 bg-brand-950/20 shadow-xl shadow-brand-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl border ${isActive ? 'bg-brand-500/20 text-brand-400 border-brand-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{proj.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400">{proj.environment || 'Staging'}</span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => selectProject(proj.id)}
                      className="text-xs text-brand-400 hover:text-white font-semibold underline"
                    >
                      Switch
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {proj.description || 'Enterprise marketing & attribution platform.'}
                </p>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Server className="w-3.5 h-3.5 text-slate-500" />
                    <span>App: <strong className="text-slate-200">{proj.application_name}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Code2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">Tech: <strong className="text-slate-200">{proj.technology}</strong></span>
                  </div>
                </div>

                {/* Modules Tags */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Modules ({proj.modules?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(proj.modules || []).slice(0, 7).map((m, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                        {m}
                      </span>
                    ))}
                    {(proj.modules?.length || 0) > 7 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        +{proj.modules.length - 7} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-500">ID: {proj.id}</span>
                {proj.id !== 'proj-cmgalaxy-01' && (
                  <button
                    onClick={() => handleDelete(proj.id, proj.name)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FolderGit2 className="w-4 h-4 text-brand-400" />
                <span>Create New QA Project</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. NextGen Mobile Banking"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="High-level description of software under test..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Application Name</label>
                  <input
                    type="text"
                    value={formData.application_name}
                    onChange={(e) => setFormData({ ...formData, application_name: e.target.value })}
                    placeholder="e.g. BankCloud SaaS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Environment</label>
                  <input
                    type="text"
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                    placeholder="e.g. QA / Staging"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Technology Stack</label>
                <input
                  type="text"
                  value={formData.technology}
                  onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                  placeholder="e.g. React, Spring Boot, PostgreSQL, Kafka"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Modules (comma-separated)</label>
                <input
                  type="text"
                  value={formData.modules}
                  onChange={(e) => setFormData({ ...formData, modules: e.target.value })}
                  placeholder="Dashboard, Login, Accounts, Payments, Settings"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

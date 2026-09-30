import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import AiProgressBanner from '../components/common/AiProgressBanner';
import {
  GitBranch,
  Sparkles,
  AlertOctagon,
  ShieldCheck,
  CheckCircle,
  FileText,
  Trash2,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function RegressionGenerator() {
  const { selectedProjectId, activeProject, modules } = useProject();
  const toast = useToast();

  const [requirementText, setRequirementText] = useState('');
  const [changesText, setChangesText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [impactSummary, setImpactSummary] = useState('');
  const [regressionList, setRegressionList] = useState([]);

  const fetchRegressionTests = async () => {
    try {
      const res = await api.get('/regression', { projectId: selectedProjectId });
      setRegressionList(res.regression_tests || []);
    } catch (err) {
      console.warn('Failed to load regression tests:', err.message);
    }
  };

  useEffect(() => {
    fetchRegressionTests();
  }, [selectedProjectId]);

  const handleGenerate = async () => {
    if (!requirementText.trim() && !changesText.trim()) {
      toast.error('Please enter the proposed change or release notes.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.post('/regression/generate', {
        project_id: selectedProjectId,
        requirement: requirementText,
        changes: changesText,
        auto_save: true
      });

      setImpactSummary(res.impact_summary || 'Identified direct and indirect impacts across core workflows.');
      toast.success(`Generated ${res.regression_test_cases?.length || 0} regression test cases!`);
      fetchRegressionTests();
    } catch (err) {
      toast.error(err.message || 'Failed to generate regression tests.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/regression/${id}`);
      toast.success('Regression test removed.');
      fetchRegressionTests();
    } catch (err) {
      toast.error('Failed to delete regression test.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
          <GitBranch className="w-4 h-4" />
          <span>Change Impact & Regression Engineering</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
          Regression Test Case Generator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Predict what existing functionality can break when code, requirements, or dependencies change.
        </p>
      </div>

      <AiProgressBanner
        isProcessing={isProcessing}
        title="Analyzing Change Impact Vectors & Synthesizing Regression Coverage..."
      />

      {/* Input Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Updated Requirement / Feature Scope
            </label>
            <textarea
              rows={4}
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
              placeholder="Describe the updated requirement or new capability..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Code Changes / Bug Fixes / Release Notes
            </label>
            <textarea
              rows={4}
              value={changesText}
              onChange={(e) => setChangesText(e.target.value)}
              placeholder="List changed backend endpoints, modified database models, or bug fix notes..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            Identifies Direct, Indirect, and Third-Party Dependency impact classifications.
          </div>
          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Analyzing Impact...' : 'Generate Regression Test Suite'}</span>
          </button>
        </div>
      </div>

      {/* Impact Summary Banner */}
      {impactSummary && (
        <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex items-start space-x-3">
          <AlertOctagon className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm text-purple-300 block mb-1">Regression Impact Analysis</span>
            <p className="leading-relaxed">{impactSummary}</p>
          </div>
        </div>
      )}

      {/* Regression Tests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span>Active Regression Test Cases ({regressionList.length})</span>
          </h3>
        </div>

        {regressionList.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
            No regression test cases generated yet. Enter updated requirements and release changes above, then click "Generate Regression Test Suite".
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {regressionList.map((reg) => {
              let badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              if (reg.classification?.includes('Critical')) badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
              if (reg.classification?.includes('Medium')) badgeBg = 'bg-blue-500/20 text-blue-300 border-blue-500/30';

              return (
                <div
                  key={reg.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/30">
                        {reg.regression_id || reg.id}
                      </span>
                      <span className="text-xs font-bold text-white">{reg.scenario}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {reg.affected_module}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeBg}`}>
                        {reg.classification || 'High Regression'}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                        {reg.impact_type || 'Direct impact'}
                      </span>
                      <button
                        onClick={() => handleDelete(reg.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Reason for Regression */}
                  <div className="text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="font-bold text-purple-400">Why at Risk (Reason for Regression):</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{reg.reason_for_regression}</p>
                  </div>

                  {/* Steps & Expected */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-400">Verification Steps:</span>
                      <div className="mt-1 space-y-1 font-mono text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        {(Array.isArray(reg.steps) ? reg.steps : (reg.steps || '').split('\n')).map((s, i) => (
                          <div key={i}>{s}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-400">Expected Regression Result:</span>
                      <div className="mt-1 text-emerald-200 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40 leading-relaxed">
                        {reg.expected_result}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

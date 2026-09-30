import React, { useState } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import AiProgressBanner from '../components/common/AiProgressBanner';
import {
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Plus,
  CheckCircle,
  HelpCircle,
  Activity,
  Layers
} from 'lucide-react';

export default function EdgeCaseAnalyzer() {
  const { selectedProjectId } = useProject();
  const toast = useToast();

  const [reqText, setReqText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [edgeCases, setEdgeCases] = useState([]);
  const [promotedIds, setPromotedIds] = useState(new Set());

  const handleAnalyze = async () => {
    if (!reqText.trim()) {
      toast.error('Please enter a requirement to uncover edge cases.');
      return;
    }

    setIsProcessing(true);
    setEdgeCases([]);

    try {
      const res = await api.post('/edge-cases/analyze', {
        project_id: selectedProjectId,
        requirement_text: reqText
      });

      setEdgeCases(res.edge_cases || []);
      toast.success(`Uncovered ${res.edge_cases?.length || 0} critical edge cases!`);
    } catch (err) {
      toast.error(err.message || 'Failed to analyze edge cases.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromote = async (edgeCase, idx) => {
    try {
      await api.post('/edge-cases/promote', {
        project_id: selectedProjectId,
        edge_case: edgeCase
      });
      const next = new Set(promotedIds);
      next.add(idx);
      setPromotedIds(next);
      toast.success('Edge case promoted to Test Case Repository!');
    } catch (err) {
      toast.error('Failed to promote edge case.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Adversarial Testing & Boundary Discovery</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
          Edge Case Analyzer
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Detect obscure failure modes: concurrency races, unicode corruption, network packet loss, session drift, and threshold overflows.
        </p>
      </div>

      <AiProgressBanner
        isProcessing={isProcessing}
        title="Simulating Hostile Inputs, Race Conditions & Boundary Anomalies..."
      />

      {/* Input */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Requirement or Workflow to Audit for Gaps
          </label>
          <textarea
            rows={3}
            value={reqText}
            onChange={(e) => setReqText(e.target.value)}
            placeholder="Describe the workflow or paste acceptance criteria..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            Checks across 25+ failure vectors including Unicode, null bytes, double submissions, and network dropouts.
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Auditing Gaps...' : 'Identify Missing Edge Cases'}</span>
          </button>
        </div>
      </div>

      {/* Edge Cases List */}
      {edgeCases.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Identified Edge Case Scenarios ({edgeCases.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {edgeCases.map((ec, idx) => {
              const isPromoted = promotedIds.has(idx);
              let riskBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              if (ec.risk_level === 'High') riskBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';

              return (
                <div
                  key={idx}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white leading-snug">{ec.missing_scenario}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${riskBadge}`}>
                        {ec.risk_level} Risk
                      </span>
                    </div>

                    <div className="text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="font-bold text-amber-400 block mb-0.5">Why It Matters:</span>
                      <p className="text-slate-300 leading-relaxed">{ec.why_it_matters}</p>
                    </div>

                    <div className="text-xs bg-brand-950/20 p-3 rounded-xl border border-brand-900/40">
                      <span className="font-bold text-brand-400 block mb-0.5">Suggested Test Case:</span>
                      <p className="text-brand-200 leading-relaxed font-medium">{ec.suggested_test_case}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handlePromote(ec, idx)}
                      disabled={isPromoted}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                        isPromoted
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 opacity-80 cursor-default'
                          : 'bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white'
                      }`}
                    >
                      {isPromoted ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Added to Repository</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Test Repository</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

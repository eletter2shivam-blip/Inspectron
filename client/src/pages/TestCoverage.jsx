import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Percent,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function TestCoverage({ onNavigateToGenerator }) {
  const { selectedProjectId } = useProject();
  const toast = useToast();

  const [matrixData, setMatrixData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coverage/matrix', { projectId: selectedProjectId });
      setMatrixData(res.matrix || []);
      setSummary(res.summary || null);
    } catch (err) {
      toast.error('Failed to load coverage matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, [selectedProjectId]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Requirement-to-Test Traceability Matrix</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
          Test Coverage & Traceability
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Maintain end-to-end traceability between software requirements, acceptance criteria, and linked test cases.
        </p>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Total Requirements</span>
            <div className="text-2xl font-black text-white font-mono mt-1">{summary.totalRequirements}</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-emerald-800/40 bg-emerald-950/10">
            <span className="text-xs font-semibold text-emerald-400">Complete Coverage</span>
            <div className="text-2xl font-black text-emerald-300 font-mono mt-1">{summary.complete}</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-amber-800/40 bg-amber-950/10">
            <span className="text-xs font-semibold text-amber-400">Partial Coverage</span>
            <div className="text-2xl font-black text-amber-300 font-mono mt-1">{summary.partial}</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-rose-800/40 bg-rose-950/10">
            <span className="text-xs font-semibold text-rose-400">Missing Coverage</span>
            <div className="text-2xl font-black text-rose-300 font-mono mt-1">{summary.missing}</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-brand-800/40 bg-brand-950/10 col-span-2 md:col-span-1">
            <span className="text-xs font-semibold text-brand-400">Overall Coverage %</span>
            <div className="text-2xl font-black text-brand-300 font-mono mt-1">
              {summary.overallCoveragePercentage}%
            </div>
          </div>
        </div>
      )}

      {/* Traceability Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3.5 w-28">Req ID</th>
                <th className="p-3.5">Requirement Title</th>
                <th className="p-3.5 w-44">Linked Test Cases</th>
                <th className="p-3.5 w-36">Coverage Bar</th>
                <th className="p-3.5 w-24">Status</th>
                <th className="p-3.5 w-20">Risk</th>
                <th className="p-3.5 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Calculating traceability matrix...
                  </td>
                </tr>
              ) : matrixData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No requirements found for this project.
                  </td>
                </tr>
              ) : (
                matrixData.map((row) => {
                  let statusBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                  let barColor = 'bg-rose-500';

                  if (row.coverage_status === 'Complete') {
                    statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                    barColor = 'bg-emerald-500';
                  } else if (row.coverage_status === 'Partial') {
                    statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                    barColor = 'bg-amber-500';
                  }

                  return (
                    <tr key={row.requirement_id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-brand-400">
                        {row.requirement_id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{row.requirement_title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{row.missing_coverage}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {row.test_case_ids && row.test_case_ids.length > 0 ? (
                            row.test_case_ids.map((id, i) => (
                              <span
                                key={i}
                                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                              >
                                {id}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">No tests linked</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div
                              className={`${barColor} h-1.5 rounded-full transition-all duration-500`}
                              style={{ width: `${row.coverage_percentage || 0}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[11px] text-slate-300 w-8 text-right">
                            {row.coverage_percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusBadge}`}>
                          {row.coverage_status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold ${
                          row.risk === 'High' ? 'text-rose-400' : row.risk === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {row.risk}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {row.coverage_status !== 'Complete' && (
                          <button
                            onClick={() => onNavigateToGenerator && onNavigateToGenerator(row.requirement_title, row.requirement_id)}
                            className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold transition-colors"
                          >
                            + Add Tests
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

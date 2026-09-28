import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import {
  History,
  Sparkles,
  Clock,
  User,
  Cpu,
  Layers,
  ChevronRight,
  Eye,
  Trash2,
  X
} from 'lucide-react';

export default function AiHistory() {
  const { selectedProjectId } = useProject();
  const toast = useToast();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/history', { projectId: selectedProjectId });
      setHistory(res.history || []);
    } catch (err) {
      toast.error('Failed to load AI generation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedProjectId]);

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all AI generation history for this project?')) return;
    try {
      await api.delete(`/history?projectId=${selectedProjectId}`);
      toast.success('History cleared.');
      fetchHistory();
    } catch (err) {
      toast.error('Failed to clear history.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Audit Trail & Provenance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            AI Generation History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review previous AI generations, model telemetry, prompt versions, and payload outputs.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3.5 w-36">Timestamp</th>
                <th className="p-3.5 w-40">Feature</th>
                <th className="p-3.5">Input Summary</th>
                <th className="p-3.5 w-36">AI Model</th>
                <th className="p-3.5 w-24">Version</th>
                <th className="p-3.5 w-28">User</th>
                <th className="p-3.5 w-20 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading AI generation history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No AI generations recorded yet for this project.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {new Date(h.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3.5 font-semibold text-white">
                      <span className="inline-flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                        <span>{h.feature}</span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-200 line-clamp-1">{h.input_type}</div>
                      <div className="text-[11px] text-slate-500 font-mono line-clamp-1 mt-0.5">{h.input_payload}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 text-brand-300 border border-slate-800">
                        {h.ai_model || 'gemini-3.8-flash'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {h.prompt_version || 'v1.0.0'}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {h.user_name || 'QA Engineer'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedEntry(h)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-brand-400 hover:text-brand-300"
                        title="Inspect Output"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Reopen Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/60 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedEntry.feature} Output</h3>
                  <p className="text-xs text-slate-400">
                    Model: {selectedEntry.ai_model} • Prompt: {selectedEntry.prompt_version} • Execution: {selectedEntry.execution_time_ms || 450}ms
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-400 block mb-1">Input Payload:</span>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap">
                  {selectedEntry.input_payload}
                </div>
              </div>

              <div>
                <span className="font-bold text-emerald-400 block mb-1">Generated Output (Structured JSON):</span>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-96">
                  <pre>{JSON.stringify(selectedEntry.generated_output, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Provenance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

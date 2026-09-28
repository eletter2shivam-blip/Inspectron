import React, { useState } from 'react';
import { Award, AlertCircle, CheckCircle, Lightbulb, ChevronRight, X } from 'lucide-react';

export default function QualityBadge({ score = 95, report = null, showDetailsButton = true }) {
  const [modalOpen, setModalOpen] = useState(false);

  let color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let badgeText = 'Quality Score: ' + score + '%';

  if (score < 60) {
    color = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (score < 80) {
    color = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  return (
    <>
      <div className="inline-flex items-center space-x-2">
        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
          <Award className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </span>

        {report && showDetailsButton && (
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs text-brand-400 hover:text-brand-300 underline font-medium flex items-center transition-colors"
          >
            Audit Report <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        )}
      </div>

      {/* Quality Details Modal */}
      {modalOpen && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/60 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl border ${color}`}>
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Test Suite Quality Audit</h3>
                  <p className="text-xs text-slate-400">ISO/IEC 29119 & ISTQB Compliance Analysis</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Score header */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Overall Quality</div>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    {report.quality_score}<span className="text-lg text-slate-500 font-normal">/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border ${color}`}>
                    Grade: {report.grade || 'A'}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">
                    {report.quality_score >= 85 ? 'Production Ready' : 'Optimization Advised'}
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {report.strengths && report.strengths.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center mb-2">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {report.strengths.map((str, i) => (
                      <li key={i} className="flex items-start space-x-2 bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/40">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {report.weaknesses && report.weaknesses.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center mb-2">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Areas For Improvement
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {report.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start space-x-2 bg-amber-950/20 p-2 rounded-lg border border-amber-900/40">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Suggestions */}
              {report.suggestions && report.suggestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center mb-2">
                    <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Recommendations
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {report.suggestions.map((sug, i) => (
                      <li key={i} className="flex items-start space-x-2 bg-brand-950/20 p-2 rounded-lg border border-brand-900/40">
                        <span className="text-brand-400 font-bold">→</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

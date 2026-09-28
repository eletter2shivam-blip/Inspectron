import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, Loader2 } from 'lucide-react';

const DEFAULT_STEPS = [
  'Analyzing requirement specification & actors...',
  'Understanding business rules & constraints...',
  'Generating comprehensive test scenarios...',
  'Evaluating boundary conditions & edge cases...',
  'Validating schema & test case quality score...'
];

export default function AiProgressBanner({ isProcessing, customSteps, title = 'AI QA Engine Processing' }) {
  const steps = customSteps || DEFAULT_STEPS;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isProcessing, steps]);

  if (!isProcessing) return null;

  return (
    <div className="mb-6 p-4 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/60 via-slate-900/90 to-brand-950/60 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-400/30">
            <Sparkles className="w-4 h-4 animate-spin text-brand-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">{title}</h4>
            <p className="text-xs text-brand-300 font-medium">Model: Gemini 3.8 Flash & Heuristic Verification</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
          <span className="text-xs font-mono text-slate-300">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden mb-3">
        <div
          className="bg-gradient-to-r from-brand-500 to-indigo-500 h-1.5 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.round(((currentStepIndex + 1) / steps.length) * 100)}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={idx}
              className={`flex items-center space-x-2 p-2 rounded-lg border transition-all duration-300 ${
                isDone
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                  : isCurrent
                  ? 'border-brand-500/60 bg-brand-900/40 text-brand-200 font-semibold shadow-inner'
                  : 'border-slate-800 bg-slate-900/40 text-slate-500'
              }`}
            >
              {isDone ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                  {idx + 1}
                </span>
              )}
              <span className="truncate">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import AiProgressBanner from '../components/common/AiProgressBanner';
import QualityBadge from '../components/common/QualityBadge';
import ScriptPreviewModal from '../components/common/ScriptPreviewModal';
import {
  Sparkles,
  FileCheck,
  Award,
  Layers,
  Shield,
  Download,
  Code2,
  CheckCircle2,
  Filter,
  ArrowRight
} from 'lucide-react';

export default function TestCaseGenerator({ initialRequirement = '', initialTitle = '', onNavigateToRepository }) {
  const { selectedProjectId, activeProject, modules } = useProject();
  const toast = useToast();

  const [reqText, setReqText] = useState(initialRequirement || 'As a registered Inspectron user, I want to reset my password using my registered email so that I can regain access to my account. Token expires in 15 minutes, single use only.');
  const [selectedModule, setSelectedModule] = useState('Login');
  const [featureName, setFeatureName] = useState(initialTitle || 'Password Reset Flow');
  const [focus, setFocus] = useState('Comprehensive (Positive, Negative, Boundary, Security, Session)');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCases, setGeneratedCases] = useState([]);
  const [qualityReport, setQualityReport] = useState(null);

  // Script preview modal state
  const [selectedCaseForScript, setSelectedCaseForScript] = useState(null);

  useEffect(() => {
    if (initialRequirement) {
      setReqText(initialRequirement);
    }
    if (initialTitle) {
      setFeatureName(initialTitle);
    }
  }, [initialRequirement, initialTitle]);

  const handleGenerate = async () => {
    if (!reqText.trim()) {
      toast.error('Please enter a requirement to generate test cases.');
      return;
    }

    setIsGenerating(true);
    setGeneratedCases([]);
    setQualityReport(null);

    try {
      const res = await api.post('/testcases/generate', {
        project_id: selectedProjectId,
        requirement_text: reqText,
        module: selectedModule,
        feature: featureName,
        focus,
        auto_save: true
      });

      setGeneratedCases(res.test_cases || []);
      setQualityReport(res.quality_report || null);
      toast.success(`Successfully generated and saved ${res.count} structured test cases!`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate test cases.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format) => {
    window.open(`/api/export/testcases?format=${format}&projectId=${selectedProjectId}&module=${selectedModule}`, '_blank');
    toast.info(`Exporting test cases to ${format.toUpperCase()}...`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Test Scenario Synthesis</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Test Case Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate positive, negative, boundary, security, and compatibility test cases with built-in quality auditing.
          </p>
        </div>

        {generatedCases.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('xlsx')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => onNavigateToRepository && onNavigateToRepository()}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 flex items-center space-x-2 transition-all"
            >
              <span>View In Repository</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Stepped AI Banner */}
      <AiProgressBanner
        isProcessing={isGenerating}
        title="Synthesizing Test Scenarios & Auditing Quality Score..."
      />

      {/* Configuration & Input Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
            >
              {(modules || []).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Feature / Epic Name
            </label>
            <input
              type="text"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              placeholder="e.g. Password Reset"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Testing Focus & Coverage
            </label>
            <select
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
            >
              <option value="Comprehensive (Positive, Negative, Boundary, Security, Session)">Comprehensive (Positive, Negative, Boundary, Security)</option>
              <option value="Adversarial & Boundary Focused">Adversarial & Boundary Focused</option>
              <option value="Security, Auth & Session Only">Security, Auth & Session Only</option>
              <option value="Smoke & Sanity Happy Paths Only">Smoke & Sanity Happy Paths Only</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Requirement Specification / Acceptance Criteria
          </label>
          <textarea
            rows={4}
            value={reqText}
            onChange={(e) => setReqText(e.target.value)}
            placeholder="Paste requirements, acceptance criteria or Jira ticket text..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500 resize-y"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Automatic deduplication & quality audit active</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Structured Test Cases'}</span>
          </button>
        </div>
      </div>

      {/* Quality Engine Audit Banner */}
      {qualityReport && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white">Quality Audit Score</h4>
                <QualityBadge score={qualityReport.quality_score} report={qualityReport} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated against duplicate scenarios, missing preconditions, and non-testable language.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400">Total Generated: <strong className="text-white font-mono">{generatedCases.length}</strong></span>
            <span className="text-slate-400">Grade: <strong className="text-emerald-400 font-mono">{qualityReport.grade}</strong></span>
          </div>
        </div>
      )}

      {/* Generated Test Cases List */}
      {generatedCases.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Generated Test Cases ({generatedCases.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Auto-saved to Test Repository</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {generatedCases.map((tc, idx) => (
              <div
                key={tc.id || idx}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-brand-400 bg-brand-950/60 px-2.5 py-1 rounded-lg border border-brand-500/30">
                      {tc.test_case_id || `TC-${idx + 1}`}
                    </span>
                    <span className="text-xs font-bold text-white">{tc.title}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {tc.test_type || 'Functional'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      tc.priority?.includes('P1') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {tc.priority}
                    </span>
                    <button
                      onClick={() => setSelectedCaseForScript(tc)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white transition-colors"
                      title="Generate Automation Script"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-400">Preconditions:</span>
                    <p className="text-slate-300 mt-0.5">{tc.preconditions || 'None'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Test Data:</span>
                    <p className="text-slate-300 font-mono text-[11px] mt-0.5">{tc.test_data || 'N/A'}</p>
                  </div>
                </div>

                {/* Steps */}
                <div className="text-xs">
                  <span className="font-bold text-slate-400">Steps:</span>
                  <div className="mt-1 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
                    {(Array.isArray(tc.steps) ? tc.steps : (tc.steps || '').split('\n')).map((step, sIdx) => (
                      <div key={sIdx}>{step}</div>
                    ))}
                  </div>
                </div>

                {/* Expected Result */}
                <div className="text-xs bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/40">
                  <span className="font-bold text-emerald-400">Expected Result:</span>
                  <p className="text-emerald-200 mt-0.5 leading-relaxed">{tc.expected_result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automation Script Preview Modal */}
      <ScriptPreviewModal
        isOpen={!!selectedCaseForScript}
        onClose={() => setSelectedCaseForScript(null)}
        testCase={selectedCaseForScript}
      />
    </div>
  );
}

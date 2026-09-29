import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import AiProgressBanner from '../components/common/AiProgressBanner';
import {
  FileSearch,
  Sparkles,
  Users,
  ShieldAlert,
  HelpCircle,
  AlertTriangle,
  GitFork,
  CheckCircle,
  Layers,
  ArrowRight,
  Upload,
  BookOpen,
  Download,
  CheckSquare
} from 'lucide-react';

const DEFAULT_SAMPLE_REQUIREMENTS = [
  {
    title: 'Self-Service Password Reset (Jira: CMG-104)',
    text: 'As a user, I want to reset my password using my registered email so that I can regain access to my account. The link should expire in 15 minutes, be single-use, and enforce strong password complexity (min 8 chars, 1 uppercase, 1 special char). Rate limit to 3 requests per hour.'
  },
  {
    title: 'Omnichannel Campaign Creation (PRD-Campaign)',
    text: 'As an agency marketing lead, I want to create a unified marketing campaign in Inspectron and simultaneously push budgets, audiences, and ad creative to Google Ads and Meta Ads Manager, so that I can manage omnichannel campaigns from one single dashboard without context switching.'
  },
  {
    title: 'CSV Bulk Lead Import with Validation',
    text: 'As a sales administrator, I want to upload a CSV file with up to 10,000 lead records and validate email formats, phone numbers, and duplicate entries, so that invalid records are flagged before importing into PostgreSQL.'
  }
];

const ANALYSIS_STEPS = [
  'Deconstructing user story & business goals...',
  'Auditing completeness & identifying ambiguities...',
  'Evaluating functional, security & data risks...',
  'Formulating Given/When/Then acceptance criteria...',
  'Synthesizing edge cases, test scenarios & QA scores...'
];

export default function RequirementsAnalyzer({ onNavigateToGenerator }) {
  const { selectedProjectId } = useProject();
  const toast = useToast();

  const [samples, setSamples] = useState(DEFAULT_SAMPLE_REQUIREMENTS);
  const [inputText, setInputText] = useState(DEFAULT_SAMPLE_REQUIREMENTS[0].text);
  const [title, setTitle] = useState(DEFAULT_SAMPLE_REQUIREMENTS[0].title);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);

  // Fetch real sample requirements from backend API on mount
  useEffect(() => {
    api.get('/requirements/samples')
      .then(res => {
        if (res?.samples && Array.isArray(res.samples) && res.samples.length > 0) {
          setSamples(res.samples);
        }
      })
      .catch(() => {
        // Silently preserve local default samples if network is offline
      });
  }, []);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter or select a requirement to analyze.');
      return;
    }

    setIsProcessing(true);
    setAnalysisResult(null);
    setAnalysisId(null);

    try {
      const res = await api.post('/requirements/analyze', {
        requirement_text: inputText,
        title,
        project_id: selectedProjectId,
        source: 'Requirement Analyzer'
      });

      const result = res.analysis || res.data;
      setAnalysisResult(result);
      setAnalysisId(res.analysisId || res.requirement_id);
      toast.success('Requirement analyzed successfully with comprehensive QA intelligence!');
    } catch (err) {
      toast.error(err.message || 'Failed to analyze requirement.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setInputText(content);
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
        toast.info(`Loaded requirement document: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportMarkdown = () => {
    if (!analysisResult) return;

    const reportContent = `# Inspectron QA Intelligence Report: ${title}
Generated: ${new Date().toLocaleString()}

## 1. Executive Summary
${analysisResult.summary || 'N/A'}

## 2. Quality Score & Risk Assessment
- Overall Quality Score: ${analysisResult.quality_score?.overall || 85}/100
- QA Risk Level: ${analysisResult.risk_assessment?.risk_level || analysisResult.risk_level || 'MEDIUM'} (${analysisResult.risk_assessment?.overall_score || analysisResult.risk_score || 45}/100)

## 3. Actors & Target Roles
${(analysisResult.actors || []).map(a => `- ${a}`).join('\n')}

## 4. Preconditions
${(analysisResult.preconditions || []).map(p => `- ${p}`).join('\n')}

## 5. Business Rules
${(analysisResult.business_rules || []).map(b => `- ${b}`).join('\n')}

## 6. Acceptance Criteria
${(analysisResult.acceptance_criteria || []).map(ac => `- ${ac}`).join('\n')}

## 7. Ambiguities & Clarification Needs
${(analysisResult.ambiguities || []).map(a => `- ${typeof a === 'object' ? `${a.statement}: ${a.issue}` : a}`).join('\n')}

## 8. Risks & Mitigations
${(analysisResult.risks || []).map(r => `- ${typeof r === 'object' ? `[${r.category}] ${r.risk}` : r}`).join('\n')}
`;

    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_QA_Report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded QA Intelligence report as Markdown!');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <FileSearch className="w-4 h-4" />
            <span>AI QA Requirements Intelligence</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Requirements Analyzer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deconstruct stories, identify ambiguities, surface hidden risks, and generate acceptance criteria.
          </p>
        </div>

        {analysisResult && (
          <div className="flex items-center space-x-3 self-start">
            <button
              onClick={handleExportMarkdown}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs transition-all flex items-center space-x-2 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>

            <button
              onClick={() => onNavigateToGenerator && onNavigateToGenerator(inputText, title)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Test Cases From This</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Stepped AI Progress Banner */}
      <AiProgressBanner
        isProcessing={isProcessing}
        customSteps={ANALYSIS_STEPS}
        title="Analyzing Requirement & Deconstructing Business Logic..."
      />

      {/* Input Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Requirement or User Story Input
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Quick Samples:</span>
            {samples.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(sample.text);
                  setTitle(sample.title);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 font-medium transition-colors"
              >
                Sample {idx + 1}
              </button>
            ))}

            <label className="cursor-pointer text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium transition-colors flex items-center space-x-1.5">
              <Upload className="w-3 h-3 text-slate-400" />
              <span>Upload Doc (.txt/.md)</span>
              <input type="file" accept=".txt,.md,.json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Requirement Title (e.g. User Story: Password Reset Flow)"
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 font-medium placeholder:text-slate-600"
        />

        <textarea
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter user story, acceptance criteria, or Jira requirement text here..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed resize-y placeholder:text-slate-600"
        />

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Analyzing with AI...' : 'Run Deep QA Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Quality & Risk Score Banner */}
          {(analysisResult.quality_score || analysisResult.risk_assessment) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quality Score */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Requirement Quality Score
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-black text-brand-400 font-mono">
                      {analysisResult.quality_score?.overall || 85}
                      <span className="text-sm text-slate-500 font-normal">/100</span>
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30">
                      {analysisResult.quality_score?.overall >= 80 ? 'Production Ready' : 'Clarifications Advised'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 text-[10px] text-slate-400 font-mono">
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800">
                    Clarity: {analysisResult.quality_score?.clarity || 80}%
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800">
                    Testability: {analysisResult.quality_score?.testability || 85}%
                  </span>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    QA Risk Assessment
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl font-black font-mono ${
                      analysisResult.risk_assessment?.risk_level === 'CRITICAL' ? 'text-rose-400' :
                      analysisResult.risk_assessment?.risk_level === 'HIGH' ? 'text-amber-400' :
                      analysisResult.risk_assessment?.risk_level === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      {analysisResult.risk_assessment?.risk_level || analysisResult.risk_level || 'MEDIUM'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Risk Score: {analysisResult.risk_assessment?.overall_score || analysisResult.risk_score || 45}/100
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 text-[10px] text-slate-400 font-mono">
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800">
                    Sec: {analysisResult.risk_assessment?.breakdown?.security || 55}%
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800">
                    Data: {analysisResult.risk_assessment?.breakdown?.data_integrity || 45}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Executive Summary */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-brand-500/30 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" /> Requirement Summary
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {analysisResult.summary}
            </p>
          </div>

          {/* Grid Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Actors */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" /> Actors & Roles
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysisResult.actors || []).map((actor, idx) => (
                  <li key={idx} className="flex items-center space-x-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                    <span>{actor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preconditions */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" /> Preconditions
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysisResult.preconditions || []).map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Business Rules */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center">
                <Layers className="w-4 h-4 mr-2" /> Business Rules
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysisResult.business_rules || []).map((rule, idx) => (
                  <li key={idx} className="flex items-start space-x-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-purple-400 font-bold shrink-0">§</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Acceptance Criteria */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" /> Generated Acceptance Criteria
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                {(analysisResult.acceptance_criteria || []).map((ac, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-brand-950/20 border border-brand-900/50 flex items-start space-x-2">
                    <span className="text-brand-400 font-bold font-mono shrink-0">AC-{idx + 1}:</span>
                    <span>{typeof ac === 'string' ? ac.replace(/^AC-\d+:\s*/, '') : JSON.stringify(ac)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dependencies */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center">
                <GitFork className="w-4 h-4 mr-2" /> System Dependencies
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysisResult.dependencies || []).map((dep, idx) => (
                  <li key={idx} className="flex items-center space-x-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                    <span>{dep}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ambiguities - Critical QA Section */}
            <div className="glass-card p-5 rounded-2xl border border-amber-900/40 bg-amber-950/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" /> Ambiguous Statements
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysisResult.ambiguities || []).map((amb, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-start space-x-2">
                    <span className="text-amber-400 font-bold shrink-0">?</span>
                    <span className="text-xs text-slate-200">
                      {typeof amb === 'object'
                        ? `${amb.severity ? `[${amb.severity}] ` : ''}${amb.statement ? `"${amb.statement}": ` : ''}${amb.issue || amb.recommendation || ''}`
                        : amb}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Information */}
            <div className="glass-card p-5 rounded-2xl border border-orange-900/40 bg-orange-950/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" /> Missing Information (Clarification Needed)
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysisResult.missing_information || []).map((info, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-orange-950/30 border border-orange-800/40 flex items-start space-x-2">
                    <span className="text-orange-400 font-bold shrink-0">!</span>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks & Testable Conditions */}
            <div className="glass-card p-5 rounded-2xl border border-rose-900/40 bg-rose-950/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2" /> Risks & Testable Conditions
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysisResult.risks || []).map((risk, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 flex items-start space-x-2">
                    <span className="text-rose-400 font-bold shrink-0">⚠</span>
                    <span className="text-xs text-slate-200">
                      {typeof risk === 'object'
                        ? `[${risk.category || 'Risk'}] ${risk.severity ? `${risk.severity}: ` : ''}${risk.risk || risk.description || ''}${risk.mitigation ? ` (Mitigation: ${risk.mitigation})` : ''}`
                        : risk}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Edge Cases (If Available) */}
            {analysisResult.edge_cases && analysisResult.edge_cases.length > 0 && (
              <div className="glass-card p-5 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-2" /> Critical Edge Cases
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  {analysisResult.edge_cases.map((ec, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-200">{typeof ec === 'object' ? ec.case : ec}</span>
                        {typeof ec === 'object' && ec.trigger && (
                          <p className="text-[11px] text-slate-400 mt-0.5">Trigger: {ec.trigger}</p>
                        )}
                      </div>
                      {typeof ec === 'object' && ec.risk_level && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 border border-rose-800/50 text-rose-300 shrink-0">
                          {ec.risk_level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QA Test Scenarios (If Available) */}
            {analysisResult.test_scenarios && analysisResult.test_scenarios.length > 0 && (
              <div className="glass-card p-5 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2" /> Priority QA Test Scenarios
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  {analysisResult.test_scenarios.map((ts, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-950 border border-teal-800 text-teal-300 uppercase">
                          {typeof ts === 'object' ? ts.type || 'QA' : 'QA'}
                        </span>
                        <span className="font-medium text-slate-200 text-xs">
                          {typeof ts === 'object' ? ts.title : ts}
                        </span>
                      </div>
                      {typeof ts === 'object' && ts.expected_result && (
                        <p className="text-[11px] text-slate-400 font-mono">
                          Expected: {ts.expected_result}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stakeholder Clarification Questions (If Available) */}
            {analysisResult.clarification_questions && analysisResult.clarification_questions.length > 0 && (
              <div className="glass-card p-5 rounded-2xl border border-slate-800 md:col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" /> Stakeholder Clarification Questions
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  {analysisResult.clarification_questions.map((cq, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-200">{typeof cq === 'object' ? cq.question : cq}</p>
                        {typeof cq === 'object' && cq.reason && (
                          <p className="text-[11px] text-indigo-300/80 mt-1">Rationale: {cq.reason}</p>
                        )}
                      </div>
                      {typeof cq === 'object' && cq.target_role && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 shrink-0">
                          {cq.target_role}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

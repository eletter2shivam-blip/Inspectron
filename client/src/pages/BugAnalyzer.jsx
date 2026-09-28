import React, { useState } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import AiProgressBanner from '../components/common/AiProgressBanner';
import {
  Bug,
  Sparkles,
  AlertCircle,
  FileCheck,
  CheckCircle,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  Layers
} from 'lucide-react';

export default function BugAnalyzer({ onNavigateToRegression }) {
  const { selectedProjectId, modules } = useProject();
  const toast = useToast();

  const [title, setTitle] = useState('Meta Ads OAuth Token Expiration Causes Silent Sync Failures');
  const [description, setDescription] = useState('When an agency token expires or is revoked in Facebook Business Manager, campaign creation in CMGalaxy enters an unhandled retry loop without notifying the user or showing an alert badge.');
  const [steps, setSteps] = useState('1. Connect Meta Ads Account\n2. In Facebook Business Manager, revoke OAuth access token\n3. In CMGalaxy, trigger "Publish Campaign"\n4. Observe campaign sync progress bar');
  const [expected, setExpected] = useState('Campaign sync catches Meta error code 190, halts retry, transitions campaign to AUTH_EXPIRED, and shows error notification.');
  const [actual, setActual] = useState('Campaign remains stuck at "Publishing (45%)" indefinitely. Worker logs flooded with 400 Bad Request.');
  const [affectedModule, setAffectedModule] = useState('Meta Ads');
  const [environment, setEnvironment] = useState('Production');
  const [browser, setBrowser] = useState('Chrome 128 / macOS 14');
  const [buildVersion, setBuildVersion] = useState('v2.4.1-rc3');

  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [createdRegressionTests, setCreatedRegressionTests] = useState([]);

  const handleAnalyze = async () => {
    if (!title.trim() || !steps.trim() || !expected.trim() || !actual.trim()) {
      toast.error('Please fill in Bug Title, Steps to Reproduce, Expected Result, and Actual Result.');
      return;
    }

    setIsProcessing(true);
    setAnalysisResult(null);
    setCreatedRegressionTests([]);

    try {
      const res = await api.post('/bugs/analyze', {
        project_id: selectedProjectId,
        title,
        description,
        steps_to_reproduce: steps,
        expected_result: expected,
        actual_result: actual,
        affected_module: affectedModule,
        environment,
        browser,
        build_version: buildVersion,
        auto_save: true
      });

      setAnalysisResult(res.analysis);
      setCreatedRegressionTests(res.created_regression_tests || []);
      toast.success('Bug diagnosed! Root cause identified and Bug -> Regression tests generated!');
    } catch (err) {
      toast.error(err.message || 'Failed to analyze defect.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
            <Bug className="w-4 h-4" />
            <span>Root Cause Analysis & Defect Hardening</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Bug Analyzer & RCA Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Convert reported defects into technical hypotheses, regression safeguards, and preventative test scenarios.
          </p>
        </div>

        {createdRegressionTests.length > 0 && (
          <button
            onClick={() => onNavigateToRegression && onNavigateToRegression()}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition-all self-start"
          >
            <GitBranch className="w-4 h-4" />
            <span>View {createdRegressionTests.length} Created Regression Tests</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        )}
      </div>

      <AiProgressBanner
        isProcessing={isProcessing}
        title="Diagnosing Defect, Formulating Root Cause & Generating Regression Tests..."
      />

      {/* Input Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Defect Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Password reset link fails on mobile Safari"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Affected Module
            </label>
            <select
              value={affectedModule}
              onChange={(e) => setAffectedModule(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-rose-500"
            >
              {modules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Steps to Reproduce
          </label>
          <textarea
            rows={3}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
              Expected Result
            </label>
            <textarea
              rows={2}
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-emerald-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1.5">
              Actual Result
            </label>
            <textarea
              rows={2}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-rose-200 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Environment</label>
            <input
              type="text"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Browser / OS</label>
            <input
              type="text"
              value={browser}
              onChange={(e) => setBrowser(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Build / Release</label>
            <input
              type="text"
              value={buildVersion}
              onChange={(e) => setBuildVersion(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            Automatically synthesizes preventative Bug → Regression test cases upon analysis.
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Diagnosing...' : 'Analyze Bug & Generate Tests'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Root cause hypothesis card */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Root Cause Hypothesis</span>
            </div>
            <p className="text-sm font-semibold text-rose-200 leading-relaxed">
              {analysisResult.root_cause_hypothesis}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Reproduction Scenario */}
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Reproduction Scenario
              </span>
              <p className="text-slate-200 leading-relaxed">{analysisResult.reproduction_scenario}</p>
            </div>

            {/* Regression Test Scenario */}
            <div className="glass-card p-4 rounded-xl border border-purple-800/40 bg-purple-950/20">
              <span className="font-bold text-purple-400 uppercase tracking-wider block mb-1">
                Regression Test Scenario
              </span>
              <p className="text-purple-200 leading-relaxed font-medium">{analysisResult.regression_test_scenario}</p>
            </div>

            {/* Negative Scenario */}
            <div className="glass-card p-4 rounded-xl border border-amber-800/40 bg-amber-950/20">
              <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Negative Error Handling Scenario
              </span>
              <p className="text-amber-200 leading-relaxed">{analysisResult.negative_scenario}</p>
            </div>
          </div>

          {/* Collateral Risk Areas & Suggested Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center mb-2">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Collateral Risk Areas
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {(analysisResult.risk_areas || []).map((ra, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{ra}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-brand-400 uppercase tracking-wider flex items-center mb-2">
                <FileCheck className="w-3.5 h-3.5 mr-1" /> Recommended Preventative Tests
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {(analysisResult.suggested_additional_tests || []).map((st, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-brand-400 font-bold">→</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

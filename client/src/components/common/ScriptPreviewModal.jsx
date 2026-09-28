import React, { useState, useEffect } from 'react';
import { Code2, Copy, Check, X, FileCode2 } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function ScriptPreviewModal({ isOpen, onClose, testCase }) {
  const [framework, setFramework] = useState('playwright');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!isOpen || !testCase) return;

    setLoading(true);
    api.post('/export/script', {
      testCaseId: testCase.id,
      framework
    })
      .then(res => {
        setScript(res.script || '// No script generated');
      })
      .catch(err => {
        setScript(`// Error generating script: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [isOpen, testCase, framework]);

  if (!isOpen || !testCase) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success('Automation script copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/60 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Generate Automation Script</h3>
              <p className="text-xs text-slate-400">
                {testCase.test_case_id || testCase.id} • {testCase.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Framework Selector Tabs */}
        <div className="flex items-center space-x-2 my-4 border-b border-slate-800 pb-3">
          {[
            { id: 'playwright', label: 'Playwright (TypeScript)', lang: 'TS' },
            { id: 'selenium', label: 'Selenium (Java + TestNG)', lang: 'Java' },
            { id: 'cypress', label: 'Cypress (JavaScript)', lang: 'JS' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFramework(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                framework === tab.id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Code Viewport */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono">{framework === 'selenium' ? 'RegressionTest.java' : framework === 'cypress' ? 'test.cy.js' : 'test.spec.ts'}</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
            {loading ? 'Synthesizing automation script...' : script}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
          <div>
            Automation Candidate: <span className="text-emerald-400 font-semibold font-mono">true</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

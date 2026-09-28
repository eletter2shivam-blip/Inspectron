import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import AiProgressBanner from '../components/common/AiProgressBanner';
import {
  Network,
  Sparkles,
  Download,
  Copy,
  Check,
  Code2,
  Trash2,
  Send,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function ApiTestGenerator() {
  const { selectedProjectId } = useProject();
  const toast = useToast();

  const [method, setMethod] = useState('POST');
  const [endpoint, setEndpoint] = useState('/api/v1/campaigns');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{jwt_token}}"\n}');
  const [requestBody, setRequestBody] = useState('{\n  "name": "Q3 Growth Campaign",\n  "daily_budget_cents": 25000,\n  "channels": ["GOOGLE_ADS", "META_ADS"]\n}');
  const [auth, setAuth] = useState('Bearer Token');
  const [expectedStatus, setExpectedStatus] = useState(201);

  const [isGenerating, setIsGenerating] = useState(false);
  const [apiTests, setApiTests] = useState([]);
  const [copiedScriptId, setCopiedScriptId] = useState(null);

  const fetchApiTests = async () => {
    try {
      const res = await api.get('/api-tests', { projectId: selectedProjectId });
      setApiTests(res.api_tests || []);
    } catch (err) {
      console.warn('Failed to fetch API tests:', err.message);
    }
  };

  useEffect(() => {
    fetchApiTests();
  }, [selectedProjectId]);

  const handleGenerate = async () => {
    if (!endpoint.trim()) {
      toast.error('API endpoint path is required.');
      return;
    }

    let parsedHeaders = {};
    let parsedBody = {};
    try {
      if (headers.trim()) parsedHeaders = JSON.parse(headers);
    } catch (e) {
      toast.error('Headers must be valid JSON.');
      return;
    }

    try {
      if (requestBody.trim()) parsedBody = JSON.parse(requestBody);
    } catch (e) {
      toast.error('Request Body must be valid JSON.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.post('/api-tests/generate', {
        project_id: selectedProjectId,
        method,
        endpoint,
        headers: parsedHeaders,
        request_body: parsedBody,
        auth,
        expected_status_code: expectedStatus,
        auto_save: true
      });

      toast.success(`Generated ${res.count} structured API test scenarios!`);
      fetchApiTests();
    } catch (err) {
      toast.error(err.message || 'Failed to generate API tests.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPostman = () => {
    window.open(`/api/api-tests/export/postman?projectId=${selectedProjectId}`, '_blank');
    toast.info('Downloading Postman Collection v2.1 JSON...');
  };

  const handleCopyScript = (script, id) => {
    navigator.clipboard.writeText(script);
    setCopiedScriptId(id);
    toast.success('Postman test script copied to clipboard!');
    setTimeout(() => setCopiedScriptId(null), 2000);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api-tests/${id}`);
      toast.success('API test deleted.');
      fetchApiTests();
    } catch (err) {
      toast.error('Failed to delete API test.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Network className="w-4 h-4" />
            <span>API Quality & Contract Automation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            API Test Case Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Synthesize contract validation, authentication boundaries, rate limits, schema checks, and Postman assertion scripts.
          </p>
        </div>

        {apiTests.length > 0 && (
          <button
            onClick={handleExportPostman}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 flex items-center space-x-2 transition-all self-start"
          >
            <Download className="w-4 h-4" />
            <span>Export Postman Collection</span>
          </button>
        )}
      </div>

      <AiProgressBanner
        isProcessing={isGenerating}
        title="Synthesizing REST Contract Scenarios & Generating Postman Scripts..."
      />

      {/* Endpoint Configuration Input Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        {/* Method & Endpoint row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              HTTP Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Endpoint Route
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/api/v1/resource"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Expected Success Status
            </label>
            <input
              type="number"
              value={expectedStatus}
              onChange={(e) => setExpectedStatus(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Payload & Headers row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Headers (JSON)
            </label>
            <textarea
              rows={4}
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Request Body (JSON)
            </label>
            <textarea
              rows={4}
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            Covers Happy Path, Invalid JSON, Missing Params, 401 Auth, 403 Forbidden, 429 Rate Limits, 500 Server Errors.
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate API Test Suite'}</span>
          </button>
        </div>
      </div>

      {/* Generated API Tests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span>API Test Suite ({apiTests.length} Scenarios)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {apiTests.map((t) => (
            <div
              key={t.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                    {t.api_test_id || t.id}
                  </span>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                    t.method === 'POST' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    t.method === 'GET' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                    t.method === 'DELETE' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {t.method}
                  </span>
                  <span className="font-mono text-xs text-white">{t.endpoint}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    t.expected_status_code < 300 ? 'bg-emerald-500/20 text-emerald-300' :
                    t.expected_status_code === 401 || t.expected_status_code === 403 ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    Status: {t.expected_status_code}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Validation & Test Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-cyan-400">Assertions & Validation:</span>
                  <p className="text-slate-300 mt-1 leading-relaxed">{t.validation}</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-slate-400">Test Data / Payload Variant:</span>
                  <p className="text-slate-300 font-mono text-[11px] mt-1">{t.test_data || 'Standard input'}</p>
                </div>
              </div>

              {/* Postman Assertion Snippet */}
              {t.postman_script && (
                <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 text-[11px] text-slate-400">
                    <span className="font-mono flex items-center space-x-1.5">
                      <Code2 className="w-3 h-3 text-orange-400" />
                      <span>Postman Tests Script</span>
                    </span>
                    <button
                      onClick={() => handleCopyScript(t.postman_script, t.id)}
                      className="flex items-center space-x-1 text-slate-300 hover:text-white"
                    >
                      {copiedScriptId === t.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedScriptId === t.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                    {t.postman_script}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

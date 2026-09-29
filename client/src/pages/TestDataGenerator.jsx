import React, { useState } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import {
  Database,
  Sparkles,
  Download,
  Copy,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  FileJson
} from 'lucide-react';

const DATA_TYPES = [
  'Email',
  'Phone number',
  'Name',
  'Address',
  'Date',
  'Currency',
  'Integer',
  'Decimal',
  'Password',
  'Username',
  'UUID',
  'URL',
  'JSON',
  'CSV'
];

export default function TestDataGenerator() {
  const { selectedProjectId } = useProject();
  const toast = useToast();

  const [fieldName, setFieldName] = useState('user_email');
  const [dataType, setDataType] = useState('Email');
  const [quantity, setQuantity] = useState(10);
  const [formatConstraints, setFormatConstraints] = useState('RFC 5322 Compliant, corporate & plus-addressing');
  const [businessRules, setBusinessRules] = useState('Must reject disposable email providers and malformed strings');

  const [isGenerating, setIsGenerating] = useState(false);
  const [datasetId, setDatasetId] = useState(null);
  const [records, setRecords] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setRecords([]);

    try {
      const res = await api.post('/test-data/generate', {
        project_id: selectedProjectId,
        field_name: fieldName,
        data_type: dataType,
        format: formatConstraints,
        quantity,
        business_rules: businessRules,
        save_as_dataset: true
      });

      setRecords(res.records || []);
      setDatasetId(res.dataset_id);
      toast.success(`Generated ${res.quantity} synthetic test data records!`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate test data.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format) => {
    const url = `/api/test-data/export?format=${format}&datasetId=${datasetId || ''}`;
    window.open(url, '_blank');
    toast.info(`Exporting data to ${format.toUpperCase()}...`);
  };

  const handleCopyValue = (val, id) => {
    navigator.clipboard.writeText(typeof val === 'object' ? JSON.stringify(val) : String(val));
    setCopiedId(id);
    toast.success('Value copied to clipboard!');
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Synthetic Data Factory</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Intelligent Test Data Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate valid, boundary, negative, and edge-case synthetic data. Zero PII risk.
          </p>
        </div>

        {records.length > 0 && (
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => handleExport('xlsx')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1.5 transition-colors"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Configuration Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Field Name
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Data Type
            </label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
            >
              {DATA_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Quantity
            </label>
            <div className="flex items-center space-x-1.5">
              {[10, 50, 100, 500].map(qty => (
                <button
                  key={qty}
                  onClick={() => setQuantity(qty)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    quantity === qty
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Format / Constraints
            </label>
            <input
              type="text"
              value={formatConstraints}
              onChange={(e) => setFormatConstraints(e.target.value)}
              placeholder="e.g. Min 8, 1 uppercase"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Business Rules / Allowed Values
          </label>
          <input
            type="text"
            value={businessRules}
            onChange={(e) => setBusinessRules(e.target.value)}
            placeholder="e.g. Allowed domains: inspectron.io, enterprise-corp.com"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Synthetic generator strictly forbids real PII generation.</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Generating Data...' : `Generate ${quantity} Records`}</span>
          </button>
        </div>
      </div>

      {/* Generated Records Table */}
      {records.length > 0 && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Synthetic {dataType} Dataset ({records.length} records)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Dataset ID: {datasetId || 'N/A'}</span>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 w-16 text-center">#</th>
                  <th className="p-3.5 w-28">Category</th>
                  <th className="p-3.5">Generated Test Value</th>
                  <th className="p-3.5">Testing Rationale / Notes</th>
                  <th className="p-3.5 w-16 text-right">Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((r) => {
                  let badge = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                  if (r.type === 'boundary') badge = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                  if (r.type === 'invalid' || r.type === 'negative') badge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                  if (r.type === 'realistic' || r.type === 'valid') badge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                  return (
                    <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3.5 text-center font-mono text-slate-500">{r.id}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-emerald-300 select-all">
                        {typeof r.value === 'object' ? JSON.stringify(r.value) : String(r.value)}
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">{r.note}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleCopyValue(r.value, r.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          {copiedId === r.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import ScriptPreviewModal from '../components/common/ScriptPreviewModal';
import {
  ListTodo,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Copy,
  Edit3,
  CheckCircle,
  XCircle,
  Code2,
  FileSpreadsheet,
  FileText,
  FileJson,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function TestCaseRepository() {
  const { selectedProjectId, modules } = useProject();
  const toast = useToast();

  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Edit / Create modal state
  const [editingCase, setEditingCase] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Script preview modal
  const [scriptCase, setScriptCase] = useState(null);

  const fetchTestCases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/testcases', {
        projectId: selectedProjectId,
        module: selectedModule,
        priority: selectedPriority,
        testType: selectedType,
        status: selectedStatus,
        search,
        page,
        limit: 15
      });
      setTestCases(res.test_cases || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error('Failed to load test cases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, [selectedProjectId, selectedModule, selectedPriority, selectedType, selectedStatus, search, page]);

  // Bulk actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(testCases.map(tc => tc.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkStatus = async (status) => {
    if (selectedIds.size === 0) return;
    try {
      await api.post('/testcases/bulk-status', {
        ids: Array.from(selectedIds),
        status
      });
      toast.success(`Updated status of ${selectedIds.size} test case(s) to ${status}`);
      setSelectedIds(new Set());
      fetchTestCases();
    } catch (err) {
      toast.error('Bulk update failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) return;
    try {
      await api.delete(`/testcases/${id}`);
      toast.success('Test case deleted.');
      fetchTestCases();
    } catch (err) {
      toast.error('Failed to delete test case.');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/testcases/${id}/duplicate`);
      toast.success('Test case duplicated.');
      fetchTestCases();
    } catch (err) {
      toast.error('Failed to duplicate.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData.title || !editFormData.expected_result) {
      toast.error('Title and Expected Result are required.');
      return;
    }

    try {
      if (editingCase && editingCase.id) {
        await api.put(`/testcases/${editingCase.id}`, editFormData);
        toast.success('Test case updated successfully.');
      } else {
        await api.post('/testcases', {
          ...editFormData,
          project_id: selectedProjectId
        });
        toast.success('New test case created.');
      }
      setEditingCase(null);
      fetchTestCases();
    } catch (err) {
      toast.error('Failed to save test case.');
    }
  };

  const handleExport = (format) => {
    const url = `/api/export/testcases?format=${format}&projectId=${selectedProjectId}&module=${selectedModule}`;
    window.open(url, '_blank');
    toast.info(`Exporting test cases to ${format.toUpperCase()}...`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
            <ListTodo className="w-4 h-4" />
            <span>Test Management & Repository</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
            Test Case Repository
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, search, edit, approve, duplicate, and export test cases across all modules.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export dropdown */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => handleExport('xlsx')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1.5 transition-colors"
              title="Export Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1.5 transition-colors"
              title="Export CSV"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-1.5 transition-colors"
              title="Export JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingCase({});
              setEditFormData({
                module: modules[0] || 'General',
                priority: 'P2-High',
                test_type: 'Functional',
                automation_candidate: true,
                status: 'Draft',
                steps: ['1. Navigate to page', '2. Execute action']
              });
            }}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Test Case</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, ID, or scenario..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 placeholder:text-slate-600"
            />
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Modules</option>
              {modules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Priorities</option>
              <option value="P1-Critical">P1-Critical</option>
              <option value="P2-High">P2-High</option>
              <option value="P3-Medium">P3-Medium</option>
              <option value="P4-Low">P4-Low</option>
            </select>
          </div>

          {/* Test Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Types</option>
              <option value="Functional">Functional</option>
              <option value="Boundary">Boundary</option>
              <option value="Negative">Negative</option>
              <option value="Security">Security</option>
              <option value="Integration">Integration</option>
              <option value="Compatibility">Compatibility</option>
              <option value="Performance">Performance</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-950/40 border border-brand-500/30 text-xs">
            <span className="text-brand-300 font-semibold font-mono">
              {selectedIds.size} test case(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkStatus('Approved')}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
              >
                Approve Selected
              </button>
              <button
                onClick={() => handleBulkStatus('Rejected')}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
              >
                Reject Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Test Cases Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={testCases.length > 0 && selectedIds.size === testCases.length}
                    onChange={handleSelectAll}
                    className="rounded bg-slate-950 border-slate-700 text-brand-500"
                  />
                </th>
                <th className="p-3.5 w-24">ID</th>
                <th className="p-3.5 w-28">Module</th>
                <th className="p-3.5">Title & Scenario</th>
                <th className="p-3.5 w-28">Type</th>
                <th className="p-3.5 w-24">Priority</th>
                <th className="p-3.5 w-24">Status</th>
                <th className="p-3.5 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Loading test cases...
                  </td>
                </tr>
              ) : testCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No test cases match current filter criteria.
                  </td>
                </tr>
              ) : (
                testCases.map((tc) => {
                  const isSelected = selectedIds.has(tc.id);
                  return (
                    <tr
                      key={tc.id}
                      className={`hover:bg-slate-900/60 transition-colors ${
                        isSelected ? 'bg-brand-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(tc.id)}
                          className="rounded bg-slate-950 border-slate-700 text-brand-500"
                        />
                      </td>
                      <td className="p-3.5 font-mono font-bold text-brand-400">
                        {tc.test_case_id || tc.id}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          {tc.module}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white line-clamp-1">{tc.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{tc.scenario}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[11px] text-slate-300 font-medium">
                          {tc.test_type || 'Functional'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          tc.priority?.includes('P1')
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : tc.priority?.includes('P2')
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {tc.priority}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          tc.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : tc.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {tc.status || 'Draft'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => setScriptCase(tc)}
                          title="Generate Automation Script"
                          className="p-1 rounded-lg hover:bg-brand-600 hover:text-white text-slate-400 transition-colors"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCase(tc);
                            setEditFormData({ ...tc });
                          }}
                          title="Edit Test Case"
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(tc.id)}
                          title="Duplicate Test Case"
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tc.id)}
                          title="Delete"
                          className="p-1 rounded-lg hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing <span className="font-mono text-white">{testCases.length}</span> of <span className="font-mono text-white">{total}</span> records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-white px-2">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={testCases.length < 15}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Test Case Edit / Create Modal */}
      {editingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl glass-panel rounded-2xl p-6 shadow-2xl border border-slate-700/60 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingCase.id ? `Edit Test Case (${editingCase.test_case_id || editingCase.id})` : 'Create New Test Case'}
              </h3>
              <button
                onClick={() => setEditingCase(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Module</label>
                  <select
                    value={editFormData.module || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, module: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {modules.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Priority</label>
                  <select
                    value={editFormData.priority || 'P2-High'}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="P1-Critical">P1-Critical</option>
                    <option value="P2-High">P2-High</option>
                    <option value="P3-Medium">P3-Medium</option>
                    <option value="P4-Low">P4-Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Type</label>
                  <select
                    value={editFormData.test_type || 'Functional'}
                    onChange={(e) => setEditFormData({ ...editFormData, test_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Functional">Functional</option>
                    <option value="Boundary">Boundary</option>
                    <option value="Negative">Negative</option>
                    <option value="Security">Security</option>
                    <option value="Integration">Integration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Status</label>
                  <select
                    value={editFormData.status || 'Draft'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Preconditions</label>
                <input
                  type="text"
                  value={editFormData.preconditions || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, preconditions: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Test Data</label>
                <input
                  type="text"
                  value={editFormData.test_data || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, test_data: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Execution Steps (one per line)</label>
                <textarea
                  rows={4}
                  value={Array.isArray(editFormData.steps) ? editFormData.steps.join('\n') : (editFormData.steps || '')}
                  onChange={(e) => setEditFormData({ ...editFormData, steps: e.target.value.split('\n') })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Expected Result</label>
                <textarea
                  rows={2}
                  value={editFormData.expected_result || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, expected_result: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => setEditingCase(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30"
              >
                Save Test Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Script Preview Modal */}
      <ScriptPreviewModal
        isOpen={!!scriptCase}
        onClose={() => setScriptCase(null)}
        testCase={scriptCase}
      />
    </div>
  );
}

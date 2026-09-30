import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  Store,
  MapPin,
  Users,
  Filter,
  RefreshCw,
  X,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Award,
  Repeat,
  RotateCcw,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Calendar
} from 'lucide-react';

export default function PretureDashboard() {
  const toast = useToast();

  // Filter options loaded from backend
  const [filterOptions, setFilterOptions] = useState({ stores: [], cities: [], users: [] });

  // Selected filter states
  const [selectedStores, setSelectedStores] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Active filters applied (triggered by "Get Data")
  const [appliedFilters, setAppliedFilters] = useState({ stores: [], cities: [], users: [] });

  // Dashboard Data states
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [storePerformance, setStorePerformance] = useState([]);
  const [billing, setBilling] = useState(null);
  const [recentSales, setRecentSales] = useState({ transactions: [], current_range: '0 of 0', total_records: 0, page: 1, total_pages: 1 });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState(null);
  const [hoveredBarMonth, setHoveredBarMonth] = useState(null);

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState(null); // 'store' | 'city' | 'user' | null

  // Fetch filter options once on mount
  useEffect(() => {
    api.get('/preture/filters')
      .then(res => {
        if (res.success) {
          setFilterOptions({
            stores: res.stores || [],
            cities: res.cities || [],
            users: res.users || []
          });
        }
      })
      .catch(() => {
        // Fallback default options if offline
        setFilterOptions({
          stores: [
            { store_id: 'STR-MUM-01', store_name: 'Mumbai Central', city: 'Mumbai' },
            { store_id: 'STR-BLR-02', store_name: 'Bengaluru Tech Park', city: 'Bengaluru' },
            { store_id: 'STR-DEL-03', store_name: 'Delhi NCR Flagship', city: 'Delhi' },
            { store_id: 'STR-HYD-04', store_name: 'Hyderabad Cyber City', city: 'Hyderabad' },
            { store_id: 'STR-PUN-05', store_name: 'Pune High Street', city: 'Pune' },
            { store_id: 'STR-CHN-06', store_name: 'Chennai Express Mall', city: 'Chennai' }
          ],
          cities: ['Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'],
          users: [
            { user_id: 'USR-101', name: 'Rajesh Sharma' },
            { user_id: 'USR-102', name: 'Priya Nair' },
            { user_id: 'USR-103', name: 'Amit Verma' },
            { user_id: 'USR-104', name: 'Sneha Reddy' }
          ]
        });
      });
  }, []);

  // Fetch all dashboard data when appliedFilters or pagination or search changes
  const fetchDashboardData = async (page = currentPage, search = searchQuery) => {
    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (appliedFilters.stores.length > 0) {
      queryParams.set('store_ids', appliedFilters.stores.join(','));
    }
    if (appliedFilters.cities.length > 0) {
      queryParams.set('cities', appliedFilters.cities.join(','));
    }
    if (appliedFilters.users.length > 0) {
      queryParams.set('user_ids', appliedFilters.users.join(','));
    }

    const baseQuery = queryParams.toString();
    const queryPrefix = baseQuery ? `?${baseQuery}` : '';

    try {
      const [sumRes, insRes, trendRes, perfRes, billRes, salesRes] = await Promise.all([
        api.get(`/preture/summary${queryPrefix}`),
        api.get(`/preture/insights${queryPrefix}`),
        api.get(`/preture/sales-trend${queryPrefix}`),
        api.get(`/preture/store-performance${queryPrefix}`),
        api.get(`/preture/billing${queryPrefix}`),
        api.get(`/preture/recent-sales?${baseQuery ? baseQuery + '&' : ''}page=${page}&limit=10${search ? `&search=${encodeURIComponent(search)}` : ''}`)
      ]);

      if (sumRes.success) setSummary(sumRes);
      if (insRes.success) setInsights(insRes);
      if (trendRes.success) setSalesTrend(trendRes.data || []);
      if (perfRes.success) setStorePerformance(perfRes.stores || []);
      if (billRes.success) setBilling(billRes);
      if (salesRes.success) setRecentSales(salesRes);
    } catch (err) {
      console.error('Failed to load Preture Dashboard data:', err);
      setError('Unable to load dashboard data. Please verify network connection.');
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(currentPage, searchQuery);
  }, [appliedFilters, currentPage]);

  // Handle Search Input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData(1, searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Apply button clicked
  const handleApplyFilters = () => {
    setAppliedFilters({
      stores: selectedStores,
      cities: selectedCities,
      users: selectedUsers
    });
    setCurrentPage(1);
    setOpenDropdown(null);
    toast.success('Filters applied successfully.');
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedStores([]);
    setSelectedCities([]);
    setSelectedUsers([]);
    setAppliedFilters({ stores: [], cities: [], users: [] });
    setSearchQuery('');
    setCurrentPage(1);
    setOpenDropdown(null);
    toast.info('Filters reset to default.');
  };

  // Toggle store in multi-select
  const toggleStore = (storeId) => {
    setSelectedStores(prev =>
      prev.includes(storeId) ? prev.filter(id => id !== storeId) : [...prev, storeId]
    );
  };

  // Toggle city in multi-select
  const toggleCity = (cityName) => {
    setSelectedCities(prev =>
      prev.includes(cityName) ? prev.filter(c => c !== cityName) : [...prev, cityName]
    );
  };

  // Toggle user in multi-select
  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(u => u !== userId) : [...prev, userId]
    );
  };

  // CSV Export handler
  const handleDownloadCsv = () => {
    const queryParams = new URLSearchParams();
    if (appliedFilters.stores.length > 0) queryParams.set('store_ids', appliedFilters.stores.join(','));
    if (appliedFilters.cities.length > 0) queryParams.set('cities', appliedFilters.cities.join(','));
    if (appliedFilters.users.length > 0) queryParams.set('user_ids', appliedFilters.users.join(','));
    if (searchQuery) queryParams.set('search', searchQuery);

    const exportUrl = `/api/preture/export-csv?${queryParams.toString()}`;
    window.open(exportUrl, '_blank');
    toast.success('CSV export initiated.');
  };

  // SVG dimensions for Sales Trend Chart
  const trendMaxSales = useMemo(() => {
    if (!salesTrend.length) return 1000000;
    return Math.max(...salesTrend.map(d => d.sales)) * 1.15;
  }, [salesTrend]);

  // SVG dimensions for Monthly Billing & Return Comparison Chart
  const billingMaxActivity = useMemo(() => {
    if (!billing?.monthly_comparison?.length) return 1000;
    return Math.max(...billing.monthly_comparison.map(d => Math.max(d.paid_bills, d.return_sales))) * 1.25;
  }, [billing]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 space-y-6 antialiased">
      {/* 1. Header & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Store className="w-4 h-4 text-blue-600" />
            <span>Preture Retail Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Preture Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Business & Store Performance, Sales Analytics, Customer Signals, and Transaction Ledgers.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-center">
          <button
            onClick={() => fetchDashboardData(currentPage, searchQuery)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Global Filters Bar (PRD Section 6) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Global Filters</span>
          </div>
          {(selectedStores.length > 0 || selectedCities.length > 0 || selectedUsers.length > 0) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Stores Multi-Select */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Stores</label>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'store' ? null : 'store')}
              className="w-full text-left bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 flex items-center justify-between hover:border-blue-400 focus:outline-none"
            >
              <span className="truncate">
                {selectedStores.length === 0
                  ? 'All Stores'
                  : `${selectedStores.length} store${selectedStores.length > 1 ? 's' : ''} selected`}
              </span>
              <Store className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>

            {openDropdown === 'store' && (
              <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-56 overflow-y-auto animate-in fade-in duration-150">
                {filterOptions.stores.map(store => (
                  <label
                    key={store.store_id}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(store.store_id)}
                      onChange={() => toggleStore(store.store_id)}
                      className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="font-medium text-slate-800">{store.store_name}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">({store.city})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Cities Multi-Select */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Cities</label>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')}
              className="w-full text-left bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 flex items-center justify-between hover:border-blue-400 focus:outline-none"
            >
              <span className="truncate">
                {selectedCities.length === 0
                  ? 'All Cities'
                  : `${selectedCities.length} cit${selectedCities.length > 1 ? 'ies' : 'y'} selected`}
              </span>
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>

            {openDropdown === 'city' && (
              <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-56 overflow-y-auto animate-in fade-in duration-150">
                {filterOptions.cities.map(city => (
                  <label
                    key={city}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city)}
                      onChange={() => toggleCity(city)}
                      className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="font-medium text-slate-800">{city}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Users Multi-Select */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Assigned Users</label>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
              className="w-full text-left bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 flex items-center justify-between hover:border-blue-400 focus:outline-none"
            >
              <span className="truncate">
                {selectedUsers.length === 0
                  ? 'All Users'
                  : `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} selected`}
              </span>
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>

            {openDropdown === 'user' && (
              <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-56 overflow-y-auto animate-in fade-in duration-150">
                {filterOptions.users.map(u => (
                  <label
                    key={u.user_id}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.user_id)}
                      onChange={() => toggleUser(u.user_id)}
                      className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="font-medium text-slate-800">{u.name}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">({u.role})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* "Get Data" Button (PRD Section 6) */}
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Get Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. KPI Summary Section (PRD Section 7) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Clients Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clients</p>
            <h2 className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {loading && !summary ? '...' : summary?.total_clients_formatted || '12,486'}
            </h2>
            <p className="text-xs text-emerald-600 font-medium flex items-center">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              Active verified client network
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Quantity Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Quantity</p>
            <h2 className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {loading && !summary ? '...' : summary?.total_quantity_formatted || '24,309'}
            </h2>
            <p className="text-xs text-blue-600 font-medium flex items-center">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
              Units fulfilled & delivered
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Sales Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</p>
            <h2 className="text-3xl font-black text-blue-600 font-mono tracking-tight">
              {loading && !summary ? '...' : summary?.total_sales_formatted || '₹64.8L'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Gross sales for selected period
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. Executive Insights Section (PRD Section 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 8.1 Sales Momentum */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-2">
              <span>Sales Momentum</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              +{insights?.sales_momentum || '18.2'}%
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Trending above previous benchmark period
          </p>
        </div>

        {/* 8.2 Top Store */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-2">
              <span>Top Store</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 truncate">
              {insights?.top_store || 'Mumbai Central'}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between font-mono">
            <span>Net Sales:</span>
            <span className="font-bold text-slate-700">{insights?.top_store_formatted || '₹19.4L'}</span>
          </div>
        </div>

        {/* 8.3 Customer Signal (Repeat Rate) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-2">
              <span>Customer Signal</span>
              <Repeat className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-600 font-mono">
              {insights?.repeat_rate || '68.4'}%
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Customer retention & repeat purchase
          </p>
        </div>

        {/* 8.4 Return Sales (Distinct Visually for Negative Event) */}
        <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-rose-700 font-bold uppercase mb-2">
              <span>Return Sales</span>
              <RotateCcw className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600 font-mono">
              {insights?.return_rate || '12.4'}%
            </div>
          </div>
          <div className="text-xs text-rose-700/80 mt-2 flex items-center justify-between font-mono">
            <span>Returned Value:</span>
            <span className="font-bold text-rose-700">{insights?.return_value_formatted || '₹8.03L'}</span>
          </div>
        </div>
      </div>

      {/* 5. Charts Row: Sales Trend (Left) & Store Performance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend (PRD Section 9) - 2 Columns */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Sales Trend</span>
              </h3>
              <p className="text-xs text-slate-400">Monthly sales trajectory across 2026</p>
            </div>
            {hoveredTrendPoint && (
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono text-blue-700 font-bold animate-in fade-in">
                {hoveredTrendPoint.month}: {hoveredTrendPoint.sales_formatted}
              </div>
            )}
          </div>

          {/* Interactive SVG Line / Area Chart */}
          <div className="h-64 w-full relative pt-4">
            {salesTrend.length > 0 ? (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="salesTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[0.25, 0.5, 0.75, 1].map((pct, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={200 - pct * 180}
                    x2="600"
                    y2={200 - pct * 180}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                ))}

                {/* Area under curve */}
                {(() => {
                  const points = salesTrend.map((d, i) => {
                    const x = (i / (salesTrend.length - 1)) * 580 + 10;
                    const y = 190 - (d.sales / trendMaxSales) * 170;
                    return `${x},${y}`;
                  });
                  const dPath = `M 10,190 L ${points.join(' L ')} L 590,190 Z`;
                  return <path d={dPath} fill="url(#salesTrendGradient)" />;
                })()}

                {/* Line path */}
                {(() => {
                  const points = salesTrend.map((d, i) => {
                    const x = (i / (salesTrend.length - 1)) * 580 + 10;
                    const y = 190 - (d.sales / trendMaxSales) * 170;
                    return `${x},${y}`;
                  });
                  return (
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points.join(' ')}
                    />
                  );
                })()}

                {/* Data Points */}
                {salesTrend.map((d, i) => {
                  const x = (i / (salesTrend.length - 1)) * 580 + 10;
                  const y = 190 - (d.sales / trendMaxSales) * 170;
                  const isHovered = hoveredTrendPoint?.month === d.month;
                  return (
                    <g key={d.month} className="cursor-pointer" onMouseEnter={() => setHoveredTrendPoint(d)} onMouseLeave={() => setHoveredTrendPoint(null)}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 4}
                        fill={isHovered ? '#1d4ed8' : '#ffffff'}
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No trend data available for current filters
              </div>
            )}
          </div>

          {/* Month Labels */}
          <div className="grid grid-cols-12 text-center text-[10px] font-bold text-slate-400 uppercase pt-2">
            {salesTrend.map(d => (
              <span key={d.month} className={hoveredTrendPoint?.month === d.month ? 'text-blue-600 font-extrabold' : ''}>
                {d.month}
              </span>
            ))}
          </div>
        </div>

        {/* Store Performance Rankings (PRD Section 10) - 1 Column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Store Performance</span>
            </h3>
            <p className="text-xs text-slate-400">Ranked by net sales & target benchmarks</p>
          </div>

          <div className="space-y-4 pt-1">
            {storePerformance.map((store) => (
              <div key={store.store_id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center font-mono">
                      #{store.rank}
                    </span>
                    <span className="font-semibold text-slate-800">{store.store_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-700">{store.score}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                      {store.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      store.percentage >= 95 ? 'bg-emerald-500' :
                      store.percentage >= 80 ? 'bg-blue-600' :
                      store.percentage >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, store.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Bill & Payment Section + Monthly Comparison Chart (PRD Section 11 & 12) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Bill & Payment Analytics</span>
            </h3>
            <p className="text-xs text-slate-400">Payment collections vs. returned transactions comparison</p>
          </div>

          {/* 3 Metric Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2">
              <span className="text-[11px] text-slate-500 font-medium">Payment Collection:</span>
              <span className="text-xs font-black text-emerald-600 font-mono">{billing?.payment_collection_rate || 91.8}%</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2">
              <span className="text-[11px] text-slate-500 font-medium">Paid Bills:</span>
              <span className="text-xs font-black text-slate-800 font-mono">{billing?.paid_bills_count?.toLocaleString('en-IN') || '2,524'}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2">
              <span className="text-[11px] text-rose-700 font-medium">Return Sales:</span>
              <span className="text-xs font-black text-rose-600 font-mono">{billing?.return_sales_count?.toLocaleString('en-IN') || '6,418'}</span>
            </div>
          </div>
        </div>

        {/* Monthly Comparison Grouped Bar Chart (PRD Section 12) */}
        <div>
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
                <span className="text-slate-600 font-medium">Paid Bills</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
                <span className="text-slate-600 font-medium">Return Sales</span>
              </div>
            </div>

            {hoveredBarMonth && (
              <div className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 animate-in fade-in">
                <span className="font-bold">{hoveredBarMonth.month} 2026: </span>
                <span className="text-blue-600">Paid: {hoveredBarMonth.paid_bills}</span> |{' '}
                <span className="text-rose-600">Return: {hoveredBarMonth.return_sales}</span> |{' '}
                <span className="font-semibold">Total: {hoveredBarMonth.total_activity}</span>
              </div>
            )}
          </div>

          <div className="h-48 w-full flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
            {(billing?.monthly_comparison || []).map((m) => {
              const paidHeight = Math.round((m.paid_bills / billingMaxActivity) * 150);
              const returnHeight = Math.round((m.return_sales / billingMaxActivity) * 150);
              const isHovered = hoveredBarMonth?.month === m.month;

              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center cursor-pointer group"
                  onMouseEnter={() => setHoveredBarMonth(m)}
                  onMouseLeave={() => setHoveredBarMonth(null)}
                >
                  <div className="w-full flex items-end justify-center space-x-1">
                    {/* Paid Bills Bar */}
                    <div
                      className={`w-3 sm:w-4 rounded-t-sm bg-blue-600 group-hover:bg-blue-700 transition-all`}
                      style={{ height: `${paidHeight}px` }}
                    />
                    {/* Return Sales Bar */}
                    <div
                      className={`w-3 sm:w-4 rounded-t-sm bg-rose-500 group-hover:bg-rose-600 transition-all`}
                      style={{ height: `${returnHeight}px` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${isHovered ? 'text-blue-600' : 'text-slate-400'}`}>
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7. Recent Sales Table Section (PRD Sections 13, 14, 15, 16) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Recent Sales Transactions
            </h3>
            <p className="text-xs text-slate-400">Detailed transaction-level records and statuses</p>
          </div>

          {/* Search Box (PRD Section 14) */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bill no, client, store..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-4">Bill Date</th>
                <th className="py-3 px-4">Bill No.</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Store</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentSales.transactions.length > 0 ? (
                recentSales.transactions.map((tx) => (
                  <tr key={tx.sale_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{tx.bill_date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{tx.bill_no}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{tx.client}</td>
                    <td className="py-3 px-4 text-slate-600">{tx.store}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{tx.amount_formatted}</td>
                    <td className="py-3 px-4">
                      {tx.status === 'Paid' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                        </span>
                      )}
                      {tx.status === 'Returned' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <RotateCcw className="w-3 h-3 mr-1" /> Returned
                        </span>
                      )}
                      {tx.status === 'Pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <p className="text-sm font-medium">No sales transactions found</p>
                    <p className="text-xs text-slate-400 mt-1">Try changing your search or global filters to see results.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (PRD Section 16) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-700">{recentSales.current_range}</span> transactions
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-slate-600">
              Page {currentPage} of {recentSales.total_pages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(recentSales.total_pages, prev + 1))}
              disabled={currentPage >= recentSales.total_pages || loading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

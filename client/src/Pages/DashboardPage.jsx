import { useState, useEffect, useRef } from "react";
import {
  BookOpen, RefreshCw, CheckCircle, XCircle, Upload, Download,
  Building2, ChevronDown, TrendingUp, Database, Clock, Activity
} from "lucide-react";
import AuthButton from "../components/AuthButton";
import ExportCard from "../components/ExportCard";
import BulkImport from "../components/BulkImport";
import { exportAllErrors } from "../components/utils/exportAllErrors";
import { businessService, customerService, supplierService, stockItemService, journalService } from "../services/api";
import SalesAttachmentUpload from "../components/SalesAttachmentUpload";

// ── localStorage helpers ──────────────────────────────────────────────────
const STATS_KEY = 'cb_dashboard_stats';

function loadStats() {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { totalImported: 0, lastImportStatus: 'pending', lastExportTime: null, lastImportTime: null };
}

function saveStats(stats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
}

function formatDateTime(iso) {
  if (!iso) return 'Never';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardPage({ onLogout }) {
  const [businesses,         setBusinesses]         = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [loadingBusinesses,  setLoadingBusinesses]  = useState(false);
  const [bulkImporting,      setBulkImporting]      = useState(false);
  const [notification,       setNotification]       = useState(null);
  const [activeTab,          setActiveTab]          = useState("import");
  const [showBizDropdown,    setShowBizDropdown]    = useState(false);
  const [dashboardStats,     setDashboardStats]     = useState(loadStats);
  const dropdownRef = useRef(null);

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowBizDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => { saveStats(dashboardStats); }, [dashboardStats]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  const fetchBusinesses = async () => {
    setLoadingBusinesses(true);
    try {
      const data = await businessService.fetchBusinesses();
      const list = Array.isArray(data) ? data : [];
      setBusinesses(list);
      if (list.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(list[0].id);
        window.__businessId__ = list[0].id;
      }
      showNotification("success", `Fetched ${list.length} business(es)`);
    } catch {
      showNotification("error", "Failed to fetch businesses");
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const handleBulkImport = async (importType, rows, frontendInvalidRows = []) => {
    if (!selectedBusinessId) { showNotification("error", "No business selected."); return; }
    setBulkImporting(true);
    try {
      let result;
      if      (importType === 'customers')  result = await customerService.bulkCreateCustomers(selectedBusinessId, rows);
      else if (importType === 'suppliers')  result = await supplierService.bulkCreateSuppliers(selectedBusinessId, rows);
      else if (importType === 'stockItems') result = await stockItemService.bulkCreateStockItems(selectedBusinessId, rows);
      else                                  result = await journalService.bulkCreateJournals(rows, selectedBusinessId);

      const status = result.summary.failed === 0 ? 'success'
                   : result.summary.created > 0  ? 'partial'
                   : 'error';

      setDashboardStats(prev => ({
        ...prev,
        totalImported:    prev.totalImported + result.summary.created,
        lastImportStatus: status,
        lastImportTime:   new Date().toISOString(),
      }));

      showNotification(
        result.summary.failed === 0 ? "success" : "error",
        `✅ ${result.summary.created} imported, ❌ ${result.summary.failed} failed out of ${result.summary.total}`
      );

      if ((result.failed?.length > 0) || (frontendInvalidRows?.length > 0)) {
        exportAllErrors(result.failed || [], frontendInvalidRows, importType);
      }
    } catch {
      setDashboardStats(prev => ({
        ...prev,
        lastImportStatus: 'error',
        lastImportTime:   new Date().toISOString(),
      }));
      showNotification("error", "Bulk import failed.");
    } finally {
      setBulkImporting(false);
    }
  };

  // Called by ExportCard after successful export
  const handleExportDone = () => {
    setDashboardStats(prev => ({
      ...prev,
      lastExportTime: new Date().toISOString(),
    }));
  };

  useEffect(() => { fetchBusinesses(); }, []);

  // ── Stat Card ─────────────────────────────────────────────────────────────
  const StatCard = ({ icon: Icon, label, value, subValue, color, statusDot }) => (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon size={24} />
        </div>
        {statusDot && (
          <span className={`w-2.5 h-2.5 rounded-full mt-1 ${
            dashboardStats.lastImportStatus === 'success' ? 'bg-green-500' :
            dashboardStats.lastImportStatus === 'partial' ? 'bg-amber-400' :
            dashboardStats.lastImportStatus === 'error'   ? 'bg-red-500'   : 'bg-gray-300'
          }`} />
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
  );

  // ── Status label ──────────────────────────────────────────────────────────
  const statusLabel =
    dashboardStats.lastImportStatus === 'success' ? 'Success'  :
    dashboardStats.lastImportStatus === 'partial' ? 'Partial'  :
    dashboardStats.lastImportStatus === 'error'   ? 'Failed'   : 'Pending';

  const statusColor =
    dashboardStats.lastImportStatus === 'success' ? 'bg-green-50 text-green-600'  :
    dashboardStats.lastImportStatus === 'partial' ? 'bg-amber-50 text-amber-600'  :
    dashboardStats.lastImportStatus === 'error'   ? 'bg-red-50 text-red-600'      :
                                                     'bg-gray-50 text-gray-500';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 max-w-sm text-sm font-medium ${
          notification.type === "success" ? "bg-green-600 text-white" : "bg-red-500 text-white"
        }`}>
          {notification.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-md">
                <BookOpen className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ClearBooks</h1>
                <p className="text-xs text-gray-500">Data Management Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {businesses.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowBizDropdown(!showBizDropdown)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-gray-700 transition-all border border-gray-200 shadow-sm"
                  >
                    <Building2 size={16} className="text-gray-500" />
                    <span className="font-medium">{selectedBusiness?.name || "Select Business"}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${showBizDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showBizDropdown && (
                    <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-60 overflow-hidden">
                      <div className="max-h-80 overflow-y-auto">
                        {businesses.map(b => (
                          <button
                            key={b.id}
                            onClick={() => { setSelectedBusinessId(b.id); window.__businessId__ = b.id; setShowBizDropdown(false); }}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                              b.id === selectedBusinessId ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"
                            }`}
                          >
                            {b.name}
                            <span className="text-xs text-gray-400 ml-2">#{b.id}</span>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 px-3 py-2.5 bg-gray-50">
                        <button
                          onClick={() => { fetchBusinesses(); setShowBizDropdown(false); }}
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <RefreshCw size={12} className={loadingBusinesses ? "animate-spin" : ""} />
                          Refresh businesses
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <AuthButton isAuthenticated={true} onLogin={() => {}} onLogout={onLogout} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm">Monitor your data operations and business metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <StatCard
            icon={Building2}
            label="Total Businesses"
            value={businesses.length || '—'}
            subValue={selectedBusiness ? `Active: ${selectedBusiness.name}` : 'None selected'}
            color="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={Activity}
            label="Last Import Status"
            value={statusLabel}
            subValue={dashboardStats.lastImportTime ? formatDateTime(dashboardStats.lastImportTime) : 'No imports yet'}
            color={statusColor}
            statusDot={true}
          />

          <StatCard
            icon={TrendingUp}
            label="Total Imported"
            value={dashboardStats.totalImported.toLocaleString()}
            subValue={dashboardStats.totalImported > 0 ? 'Since last reset' : 'No data yet'}
            color="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            icon={Clock}
            label="Last Export"
            value={dashboardStats.lastExportTime
              ? new Date(dashboardStats.lastExportTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
              : 'Never'}
            subValue={dashboardStats.lastExportTime ? formatDateTime(dashboardStats.lastExportTime) : 'No exports yet'}
            color="bg-slate-50 text-slate-600"
          />

        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 mb-8 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("import")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === "import" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Upload size={16} />
            Data Import
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === "export" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Download size={16} />
            Data Export
          </button>
        </div>

        {/* Connected business pill */}
        {selectedBusiness && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-xl w-fit">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">
              Connected to <span className="font-semibold text-green-700 ml-1">{selectedBusiness.name}</span>
              <span className="text-gray-400 ml-2">· ID: {selectedBusiness.id}</span>
            </span>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === "import" && (
          <div className="space-y-6">
            <div className="mb-2">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Data Import</h3>
              <p className="text-gray-500 text-sm">Upload Excel or CSV files to bulk import data into your ClearBooks account</p>
            </div>
            <BulkImport onImport={handleBulkImport} loading={bulkImporting} />
            <SalesAttachmentUpload
              businessId={selectedBusinessId}
              showNotification={showNotification}
            />
          </div>
        )}

        {/* Export Tab */}
        {activeTab === "export" && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Data Export</h3>
              <p className="text-gray-500 text-sm">Download your data in Excel format for analysis and record keeping</p>
            </div>
            <ExportCard
              businessId={selectedBusinessId}
              showNotification={showNotification}
              onExportDone={handleExportDone}
            />
          </div>
        )}

      </main>
    </div>
  );
}
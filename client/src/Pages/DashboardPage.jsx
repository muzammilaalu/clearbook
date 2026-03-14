import { useState, useEffect } from "react";
import {
  BookOpen, RefreshCw, CheckCircle, XCircle, Upload, Download,
  Building2, ChevronDown, TrendingUp, Database, Clock, Activity
} from "lucide-react";
import AuthButton from "../components/AuthButton";
import ExportCard from "../components/ExportCard";
import BulkImport from "../components/BulkImport";
import { exportAllErrors } from "../components/utils/exportAllErrors";
import { businessService, customerService, supplierService, stockItemService, journalService } from "../services/api";

export default function DashboardPage({ onLogout }) {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("import");
  const [showBizDropdown, setShowBizDropdown] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalImported: 0,
    lastImportStatus: "pending",
    lastExportTime: null
  });

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

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
    if (!selectedBusinessId) {
      showNotification("error", "No business selected.");
      return;
    }
    setBulkImporting(true);
    try {
      let result;
      if (importType === 'customers') {
        result = await customerService.bulkCreateCustomers(selectedBusinessId, rows);
      } else if (importType === 'suppliers') {
        result = await supplierService.bulkCreateSuppliers(selectedBusinessId, rows);
      } else if (importType === 'stockItems') {
        result = await stockItemService.bulkCreateStockItems(selectedBusinessId, rows);
      } else {
        result = await journalService.bulkCreateJournals(rows, selectedBusinessId);
      }

      setDashboardStats(prev => ({
        ...prev,
        totalImported: prev.totalImported + result.summary.created,
        lastImportStatus: result.summary.failed === 0 ? "success" : "partial"
      }));

      showNotification(
        result.summary.failed === 0 ? "success" : "error",
        `✅ ${result.summary.created} imported, ❌ ${result.summary.failed} failed out of ${result.summary.total}`
      );
      const hasApiErrors = result.failed?.length > 0;
      const hasFrontendErrors = frontendInvalidRows?.length > 0;
      if (hasApiErrors || hasFrontendErrors) {
        exportAllErrors(result.failed || [], frontendInvalidRows, importType);
      }
    } catch {
      setDashboardStats(prev => ({ ...prev, lastImportStatus: "error" }));
      showNotification("error", "Bulk import failed.");
    } finally {
      setBulkImporting(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 max-w-sm text-sm font-medium ${
          notification.type === "success" ? "bg-green-600 text-white" : "bg-red-500 text-white"
        }`}>
          {notification.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {notification.message}
        </div>
      )}

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
                <div className="relative">
                  <button
                    onClick={() => setShowBizDropdown(!showBizDropdown)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-gray-700 transition-all border border-gray-200 shadow-sm"
                  >
                    <Building2 size={16} className="text-gray-500" />
                    <span className="font-medium">{selectedBusiness?.name || "Select Business"}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {showBizDropdown && (
                    <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-60 overflow-hidden">
                      <div className="max-h-80 overflow-y-auto">
                        {businesses.map(b => (
                          <button
                            key={b.id}
                            onClick={() => {
                              setSelectedBusinessId(b.id);
                              window.__businessId__ = b.id;
                              setShowBizDropdown(false);
                            }}
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

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor your data operations and business metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={Building2}
            label="Total Businesses"
            value={businesses.length}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={Activity}
            label="Last Import Status"
            value={dashboardStats.lastImportStatus === "success" ? "Success" :
                   dashboardStats.lastImportStatus === "partial" ? "Partial" :
                   dashboardStats.lastImportStatus === "error" ? "Failed" : "Pending"}
            color={dashboardStats.lastImportStatus === "success" ? "bg-green-50 text-green-600" :
                   dashboardStats.lastImportStatus === "partial" ? "bg-amber-50 text-amber-600" :
                   dashboardStats.lastImportStatus === "error" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"}
          />
          <StatCard
            icon={TrendingUp}
            label="Total Imported"
            value={dashboardStats.totalImported}
            trend="+12%"
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={Clock}
            label="Last Export"
            value={dashboardStats.lastExportTime || "Never"}
            color="bg-slate-50 text-slate-600"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 mb-8 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("import")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === "import"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Upload size={16} />
            Data Import
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === "export"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Download size={16} />
            Data Export
          </button>
        </div>

        {selectedBusiness && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-xl w-fit">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">
              Connected to <span className="font-semibold text-green-700 ml-1">{selectedBusiness.name}</span>
              <span className="text-gray-400 ml-2">· ID: {selectedBusiness.id}</span>
            </span>
          </div>
        )}

        {activeTab === "import" && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Data Import</h3>
              <p className="text-gray-600">Upload Excel or CSV files to bulk import data into your ClearBooks account</p>
            </div>
            <BulkImport onImport={handleBulkImport} loading={bulkImporting} />
          </div>
        )}

        {activeTab === "export" && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Data Export</h3>
              <p className="text-gray-600">Download your data in Excel format for analysis and record keeping</p>
            </div>
            <ExportCard
              businessId={selectedBusinessId}
              showNotification={showNotification}
              onExport={(time) => setDashboardStats(prev => ({ ...prev, lastExportTime: time }))}
            />
          </div>
        )}

      </main>
    </div>
  );
}

import { useState, useEffect }  from "react";
import { BookOpen, RefreshCw, CheckCircle, XCircle, Upload, Download, Building2, ChevronDown } from "lucide-react";
import AuthButton                from "../components/AuthButton";
import ExportCard                from "../components/ExportCard";
import BulkImport                from "../components/BulkImport";
import { exportAllErrors }       from "../utils/exportAllErrors";
import { businessService, customerService, supplierService, stockItemService, journalService } from "../services/api";

export default function DashboardPage({ onLogout }) {
  const [businesses,         setBusinesses]         = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [loadingBusinesses,  setLoadingBusinesses]  = useState(false);
  const [bulkImporting,      setBulkImporting]      = useState(false);
  const [notification,       setNotification]       = useState(null);
  const [activeTab,          setActiveTab]          = useState("import");
  const [showBizDropdown,    setShowBizDropdown]    = useState(false);

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
      showNotification("success", `${list.length} business(es) loaded`);
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
      showNotification(
        result.summary.failed === 0 ? "success" : "error",
        `✅ ${result.summary.created} imported, ❌ ${result.summary.failed} failed out of ${result.summary.total}`
      );
      const hasApiErrors      = result.failed?.length > 0;
      const hasFrontendErrors = frontendInvalidRows?.length > 0;
      if (hasApiErrors || hasFrontendErrors) {
        exportAllErrors(result.failed || [], frontendInvalidRows, importType);
      }
    } catch {
      showNotification("error", "Bulk import failed.");
    } finally {
      setBulkImporting(false);
    }
  };

  useEffect(() => { fetchBusinesses(); }, []);

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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ClearBooks</h1>
                <p className="text-xs text-gray-500">Data Management Tool</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {businesses.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowBizDropdown(!showBizDropdown)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    <Building2 size={15} className="text-gray-500" />
                    <span className="font-medium">{selectedBusiness?.name || "Select Business"}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {showBizDropdown && (
                    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-48">
                      {businesses.map(b => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setSelectedBusinessId(b.id);
                            window.__businessId__ = b.id;
                            setShowBizDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl ${
                            b.id === selectedBusinessId ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"
                          }`}
                        >
                          {b.name}
                          <span className="text-xs text-gray-400 ml-1">#{b.id}</span>
                        </button>
                      ))}
                      <div className="border-t border-gray-100 px-3 py-2">
                        <button
                          onClick={() => { fetchBusinesses(); setShowBizDropdown(false); }}
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
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

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-8 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab("import")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "import"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Upload size={16} />
            Bulk Import
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "export"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Download size={16} />
            Export Data
          </button>
        </div>

        {/* Import Tab */}
        {activeTab === "import" && (
          <div>
            {selectedBusiness && (
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Connected to <span className="font-medium text-gray-700">{selectedBusiness.name}</span>
                <span className="text-gray-400">· ID: {selectedBusiness.id}</span>
              </div>
            )}
            <BulkImport onImport={handleBulkImport} loading={bulkImporting} />
          </div>
        )}

        {/* Export Tab */}
        {activeTab === "export" && (
          <div>
            {selectedBusiness && (
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Connected to <span className="font-medium text-gray-700">{selectedBusiness.name}</span>
                <span className="text-gray-400">· ID: {selectedBusiness.id}</span>
              </div>
            )}
            <div className="max-w-lg">
              <ExportCard businessId={selectedBusinessId} showNotification={showNotification} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
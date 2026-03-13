import { useState, useEffect }  from "react";
import { BookOpen, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import AuthButton                from "../components/AuthButton";
import BusinessList              from "../components/BusinessList";
import ExportCard                from "../components/ExportCard";
import BulkImport                from "../components/BulkImport";
import { exportAllErrors }       from "../components/utils/exportAllErrors";
import { businessService, customerService, supplierService, stockItemService, journalService } from "../services/api";

export default function DashboardPage({ onLogout }) {
  const [businesses,         setBusinesses]         = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [loadingBusinesses,  setLoadingBusinesses]  = useState(false);
  const [bulkImporting,      setBulkImporting]      = useState(false);
  const [notification,       setNotification]       = useState(null);

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

  // Single handler for both customers and suppliers
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
      // Combined error Excel: ClearBooks API errors + frontend validation errors
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
    <div className="min-h-screen bg-gray-100">

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-md ${
          notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {notification.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ClearBooks Dashboard</h1>
                <p className="text-sm text-gray-600">
                  {selectedBusinessId ? `Business ID: ${selectedBusinessId}` : "Loading..."}
                </p>
              </div>
            </div>
            <AuthButton isAuthenticated={true} onLogin={() => {}} onLogout={onLogout} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* Business Selector */}
        {businesses.length > 1 && (
          <select
            value={selectedBusinessId || ""}
            onChange={(e) => { const id = Number(e.target.value); setSelectedBusinessId(id); window.__businessId__ = id; }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name} (ID: {b.id})</option>
            ))}
          </select>
        )}

        {/* Refresh */}
        <div className="flex gap-4">
          <button onClick={fetchBusinesses} disabled={loadingBusinesses}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg">
            <RefreshCw size={18} className={loadingBusinesses ? "animate-spin" : ""} />
            {loadingBusinesses ? "Loading..." : "Fetch Businesses"}
          </button>
        </div>

        {/* Business List + Export Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BusinessList businesses={businesses} loading={loadingBusinesses} />
          <ExportCard businessId={selectedBusinessId} showNotification={showNotification} />
        </div>

        {/* Unified Bulk Import */}
        <BulkImport onImport={handleBulkImport} loading={bulkImporting} />

      </main>
    </div>
  );
}
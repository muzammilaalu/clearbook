import { useState, useEffect, useRef } from "react";
import { BookOpen, RefreshCw, CheckCircle, XCircle, Upload, Download, Building2, ChevronDown, Sparkles, LogOut } from "lucide-react";
import AuthButton   from "../components/AuthButton";
import ExportCard   from "../components/ExportCard";
import BulkImport   from "../components/BulkImport";
import { exportAllErrors } from "../components/utils/exportAllErrors";
import { businessService, customerService, supplierService, stockItemService, journalService } from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; }

  .cb-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    background: #0a0f1e;
    position: relative;
    overflow-x: hidden;
  }

  /* Animated gradient mesh background */
  .cb-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 0%, rgba(59,130,246,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 100%, rgba(99,102,241,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* Grid pattern overlay */
  .cb-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }

  .cb-content { position: relative; z-index: 1; }

  /* Header */
  .cb-header {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .cb-header-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cb-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cb-logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(99,102,241,0.4);
  }

  .cb-logo h1 {
    font-size: 17px;
    font-weight: 800;
    color: #fff;
    margin: 0;
    letter-spacing: -0.3px;
  }

  .cb-logo p {
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Business dropdown */
  .cb-biz-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: rgba(255,255,255,0.8);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .cb-biz-btn:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.2);
  }

  .cb-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    background: #13192e;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    min-width: 220px;
    overflow: hidden;
    animation: dropIn 0.15s ease;
  }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .cb-dropdown-item {
    display: block;
    width: 100%;
    text-align: left;
    padding: 11px 16px;
    font-size: 13px;
    color: rgba(255,255,255,0.7);
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .cb-dropdown-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
  .cb-dropdown-item.active { color: #60a5fa; font-weight: 600; background: rgba(59,130,246,0.1); }

  .cb-dropdown-footer {
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 10px 16px;
  }

  .cb-refresh-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #60a5fa;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: color 0.2s;
  }

  .cb-refresh-btn:hover { color: #93c5fd; }

  /* Logout button */
  .cb-logout {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 10px;
    color: #f87171;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .cb-logout:hover {
    background: rgba(239,68,68,0.2);
    border-color: rgba(239,68,68,0.4);
  }

  /* Main */
  .cb-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px;
  }

  /* Page title */
  .cb-page-title {
    margin-bottom: 32px;
  }

  .cb-page-title h2 {
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 6px;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cb-page-title p {
    font-size: 14px;
    color: rgba(255,255,255,0.35);
    margin: 0;
  }

  /* Business status pill */
  .cb-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 14px;
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.2);
    border-radius: 100px;
    font-size: 12px;
    color: #34d399;
    margin-bottom: 28px;
    font-weight: 500;
  }

  .cb-status-dot {
    width: 7px;
    height: 7px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10b981;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.85); }
  }

  /* Tab bar */
  .cb-tabs {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 4px;
    margin-bottom: 32px;
  }

  .cb-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s;
    border: none;
    background: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: rgba(255,255,255,0.4);
    position: relative;
  }

  .cb-tab:hover { color: rgba(255,255,255,0.7); }

  .cb-tab.active {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: #fff;
    box-shadow: 0 4px 20px rgba(99,102,241,0.4);
  }

  .cb-tab-badge {
    font-size: 10px;
    background: rgba(255,255,255,0.15);
    padding: 2px 6px;
    border-radius: 100px;
    font-weight: 700;
  }

  /* Import panel */
  .cb-import-panel {
    animation: fadeUp 0.3s ease;
  }

  .cb-export-panel {
    animation: fadeUp 0.3s ease;
    max-width: 480px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Notification */
  .cb-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 600;
    max-width: 380px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    animation: slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(30px) scale(0.95); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }

  .cb-notification.success {
    background: linear-gradient(135deg, #064e3b, #065f46);
    border: 1px solid rgba(16,185,129,0.3);
    color: #6ee7b7;
  }

  .cb-notification.error {
    background: linear-gradient(135deg, #450a0a, #7f1d1d);
    border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5;
  }

  /* Override BulkImport + ExportCard to match dark theme */
  .cb-import-panel > div,
  .cb-export-panel > div {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    border-radius: 20px !important;
    box-shadow: 0 4px 40px rgba(0,0,0,0.3) !important;
    color: rgba(255,255,255,0.85) !important;
  }

  .cb-import-panel h2,
  .cb-import-panel h3,
  .cb-import-panel label,
  .cb-import-panel p,
  .cb-import-panel span,
  .cb-export-panel h2,
  .cb-export-panel h3,
  .cb-export-panel label,
  .cb-export-panel p,
  .cb-export-panel span {
    color: rgba(255,255,255,0.8) !important;
  }

  .cb-import-panel select,
  .cb-export-panel select {
    background: rgba(255,255,255,0.06) !important;
    border: 1px solid rgba(255,255,255,0.12) !important;
    color: rgba(255,255,255,0.85) !important;
    border-radius: 10px !important;
  }

  .cb-import-panel button:not(.cb-tab):not(.cb-biz-btn),
  .cb-export-panel button {
    transition: all 0.2s !important;
  }

  /* Dashed upload area */
  .cb-import-panel .border-dashed {
    border-color: rgba(255,255,255,0.12) !important;
    background: rgba(255,255,255,0.02) !important;
    border-radius: 14px !important;
    transition: all 0.2s !important;
  }

  .cb-import-panel .border-dashed:hover {
    border-color: rgba(99,102,241,0.4) !important;
    background: rgba(99,102,241,0.04) !important;
  }

  /* Tables */
  .cb-import-panel table th {
    background: rgba(255,255,255,0.05) !important;
    color: rgba(255,255,255,0.5) !important;
  }

  .cb-import-panel table td {
    border-color: rgba(255,255,255,0.05) !important;
    color: rgba(255,255,255,0.7) !important;
  }

  .cb-import-panel table tr:hover td {
    background: rgba(255,255,255,0.03) !important;
  }

  /* Info boxes */
  .cb-import-panel .bg-blue-50  { background: rgba(59,130,246,0.08) !important; border-color: rgba(59,130,246,0.2) !important; }
  .cb-import-panel .bg-gray-50  { background: rgba(255,255,255,0.03) !important; }
  .cb-import-panel .bg-green-50 { background: rgba(16,185,129,0.08) !important; border-color: rgba(16,185,129,0.2) !important; }
  .cb-import-panel .bg-red-50   { background: rgba(239,68,68,0.08) !important; border-color: rgba(239,68,68,0.2) !important; }

  .cb-import-panel .text-gray-500,
  .cb-import-panel .text-gray-600,
  .cb-import-panel .text-gray-700 { color: rgba(255,255,255,0.45) !important; }

  .cb-import-panel .text-green-700 { color: #34d399 !important; }
  .cb-import-panel .text-red-700   { color: #f87171 !important; }
  .cb-import-panel .text-blue-600  { color: #60a5fa !important; }

  .cb-import-panel .border-gray-200,
  .cb-import-panel .border-gray-300 { border-color: rgba(255,255,255,0.08) !important; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

  /* Animate in */
  .cb-main { animation: pageLoad 0.4s ease; }
  @keyframes pageLoad {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function DashboardPage({ onLogout }) {
  const [businesses,         setBusinesses]         = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [loadingBusinesses,  setLoadingBusinesses]  = useState(false);
  const [bulkImporting,      setBulkImporting]      = useState(false);
  const [notification,       setNotification]       = useState(null);
  const [activeTab,          setActiveTab]          = useState("import");
  const [showBizDropdown,    setShowBizDropdown]    = useState(false);
  const dropdownRef = useRef(null);

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowBizDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    if (!selectedBusinessId) { showNotification("error", "No business selected."); return; }
    setBulkImporting(true);
    try {
      let result;
      if (importType === 'customers')       result = await customerService.bulkCreateCustomers(selectedBusinessId, rows);
      else if (importType === 'suppliers')  result = await supplierService.bulkCreateSuppliers(selectedBusinessId, rows);
      else if (importType === 'stockItems') result = await stockItemService.bulkCreateStockItems(selectedBusinessId, rows);
      else                                  result = await journalService.bulkCreateJournals(rows, selectedBusinessId);

      showNotification(
        result.summary.failed === 0 ? "success" : "error",
        `✅ ${result.summary.created} imported, ❌ ${result.summary.failed} failed out of ${result.summary.total}`
      );
      if ((result.failed?.length > 0) || (frontendInvalidRows?.length > 0)) {
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
    <>
      <style>{styles}</style>
      <div className="cb-root">
        <div className="cb-content">

          {/* Notification */}
          {notification && (
            <div className={`cb-notification ${notification.type}`}>
              {notification.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {notification.message}
            </div>
          )}

          {/* Header */}
          <header className="cb-header">
            <div className="cb-header-inner">
              <div className="cb-logo">
                <div className="cb-logo-icon">
                  <BookOpen color="#fff" size={20} />
                </div>
                <div>
                  <h1>ClearBooks</h1>
                  <p>data · management · tool</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Business Dropdown */}
                {businesses.length > 0 && (
                  <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button className="cb-biz-btn" onClick={() => setShowBizDropdown(!showBizDropdown)}>
                      <Building2 size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                      <span>{selectedBusiness?.name || "Select Business"}</span>
                      <ChevronDown size={13} style={{ color: 'rgba(255,255,255,0.3)', transform: showBizDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    {showBizDropdown && (
                      <div className="cb-dropdown">
                        {businesses.map(b => (
                          <button
                            key={b.id}
                            className={`cb-dropdown-item ${b.id === selectedBusinessId ? 'active' : ''}`}
                            onClick={() => { setSelectedBusinessId(b.id); window.__businessId__ = b.id; setShowBizDropdown(false); }}
                          >
                            {b.name}
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginLeft: '6px', fontFamily: 'JetBrains Mono, monospace' }}>#{b.id}</span>
                          </button>
                        ))}
                        <div className="cb-dropdown-footer">
                          <button className="cb-refresh-btn" onClick={() => { fetchBusinesses(); setShowBizDropdown(false); }}>
                            <RefreshCw size={11} style={{ animation: loadingBusinesses ? 'spin 1s linear infinite' : 'none' }} />
                            Refresh businesses
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Logout */}
                <button className="cb-logout" onClick={onLogout}>
                  <LogOut size={14} />
                  Disconnect
                </button>
              </div>
            </div>
          </header>

          {/* Main */}
          <main className="cb-main">

            {/* Page Title */}
            <div className="cb-page-title">
              <h2>Data Management</h2>
              <p>Import & export your ClearBooks data with ease</p>
            </div>

            {/* Business Status */}
            {selectedBusiness && (
              <div className="cb-status-pill">
                <span className="cb-status-dot"></span>
                Connected to <strong style={{ marginLeft: '4px' }}>{selectedBusiness.name}</strong>
                <span style={{ color: 'rgba(52,211,153,0.5)', marginLeft: '4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>#{selectedBusiness.id}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="cb-tabs">
              <button
                className={`cb-tab ${activeTab === 'import' ? 'active' : ''}`}
                onClick={() => setActiveTab('import')}
              >
                <Upload size={15} />
                Bulk Import
                <span className="cb-tab-badge">Primary</span>
              </button>
              <button
                className={`cb-tab ${activeTab === 'export' ? 'active' : ''}`}
                onClick={() => setActiveTab('export')}
              >
                <Download size={15} />
                Export Data
              </button>
            </div>

            {/* Import Tab */}
            {activeTab === 'import' && (
              <div className="cb-import-panel">
                <BulkImport onImport={handleBulkImport} loading={bulkImporting} />
              </div>
            )}

            {/* Export Tab */}
            {activeTab === 'export' && (
              <div className="cb-export-panel">
                <ExportCard businessId={selectedBusinessId} showNotification={showNotification} />
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}
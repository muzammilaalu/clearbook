import { useState } from 'react';
import { Upload, RefreshCw, CheckCircle, XCircle, Paperclip, FileUp, ChevronDown, ChevronUp } from 'lucide-react';
import { salesService } from '../services/api';

export default function SalesAttachmentUpload({ businessId, showNotification }) {
  const [invoices,      setInvoices]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [uploadingId,   setUploadingId]   = useState(null); // invoice id currently uploading
  const [uploadResults, setUploadResults] = useState({});   // { invoiceId: { success, files: [] } }
  const [search,        setSearch]        = useState('');
  const [loaded,        setLoaded]        = useState(false);

  // ── Fetch all invoices ─────────────────────────────────────────────────
  const loadInvoices = async () => {
    if (!businessId) { showNotification('error', 'No business selected.'); return; }
    setLoading(true);
    try {
      const data = await salesService.fetchSales(businessId, 'invoices');
      const list = Array.isArray(data) ? data : [];
      setInvoices(list);
      setLoaded(true);
      if (list.length === 0) showNotification('error', 'No invoices found.');
      else showNotification('success', `${list.length} invoices loaded`);
    } catch {
      showNotification('error', 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  // ── Upload file for a specific invoice ────────────────────────────────
  const handleFileSelect = async (invoice, file) => {
    if (!file) return;
    setUploadingId(invoice.id);

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (e) => resolve(e.target.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await salesService.uploadSalesAttachments(businessId, [{
        invoice_ref:      String(invoice.id),
        file_name:        file.name,
        file_data_base64: base64,
      }]);

      if (result.summary.created > 0) {
        setUploadResults(prev => ({
          ...prev,
          [invoice.id]: {
            success: true,
            files: [...(prev[invoice.id]?.files || []), file.name],
          },
        }));
        showNotification('success', `✅ "${file.name}" uploaded to Invoice #${invoice.id}`);
      } else {
        const errMsg = result.errors?.[0]?.error || 'Upload failed';
        setUploadResults(prev => ({
          ...prev,
          [invoice.id]: { ...prev[invoice.id], lastError: errMsg },
        }));
        showNotification('error', `❌ ${errMsg}`);
      }
    } catch {
      showNotification('error', 'Upload failed.');
    } finally {
      setUploadingId(null);
    }
  };

  // ── Filter invoices by search ──────────────────────────────────────────
  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    return (
      String(inv.id).includes(q) ||
      (inv.reference || '').toLowerCase().includes(q) ||
      (inv.formattedDocumentNumber || '').toLowerCase().includes(q) ||
      (inv.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-rose-50 p-2.5 rounded-xl">
            <Paperclip className="text-rose-600" size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Upload Sales Attachments</h2>
            <p className="text-xs text-gray-500 mt-0.5">Load invoices and attach files directly</p>
          </div>
        </div>

        <button
          onClick={loadInvoices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading...' : loaded ? 'Refresh Invoices' : 'Load Invoices'}
        </button>
      </div>

      {/* Not loaded yet */}
      {!loaded && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <Paperclip size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium mb-1">No invoices loaded yet</p>
          <p className="text-xs text-gray-400">Click "Load Invoices" to fetch all invoices from ClearBooks</p>
        </div>
      )}

      {/* Search bar */}
      {loaded && invoices.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by ID, reference, or status..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
          />
          <p className="text-xs text-gray-400 mt-1.5 ml-1">
            Showing {filtered.length} of {invoices.length} invoices
          </p>
        </div>
      )}

      {/* Invoice list */}
      {loaded && filtered.length > 0 && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map(inv => {
            const result   = uploadResults[inv.id];
            const isUploading = uploadingId === inv.id;

            return (
              <div
                key={inv.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  result?.success ? 'bg-green-50 border-green-200' :
                  result?.lastError ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Invoice info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded">
                      #{inv.id}
                    </span>
                    {(inv.formattedDocumentNumber || inv.reference) && (
                      <span className="text-xs text-gray-600 font-medium truncate">
                        {inv.formattedDocumentNumber || inv.reference}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      inv.status === 'approved' ? 'bg-green-100 text-green-700' :
                      inv.status === 'draft'    ? 'bg-gray-100 text-gray-600'   :
                      inv.status === 'paid'     ? 'bg-blue-100 text-blue-700'   :
                                                   'bg-amber-100 text-amber-700'
                    }`}>
                      {inv.status || 'unknown'}
                    </span>
                    {inv.gross !== undefined && (
                      <span className="text-xs text-gray-500 ml-auto">
                        £{Number(inv.gross).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Uploaded files list */}
                  {result?.files?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {result.files.map((f, i) => (
                        <span key={i} className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} />
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Error */}
                  {result?.lastError && (
                    <p className="text-xs text-red-600 mt-1">{result.lastError}</p>
                  )}
                </div>

                {/* Upload button */}
                <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex-shrink-0 ${
                  isUploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                }`}>
                  {isUploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileUp size={13} />
                  )}
                  {isUploading ? 'Uploading...' : 'Attach File'}
                  <input
                    type="file"
                    className="hidden"
                    disabled={isUploading}
                    onChange={e => e.target.files[0] && handleFileSelect(inv, e.target.files[0])}
                  />
                </label>
              </div>
            );
          })}
        </div>
      )}

      {/* No results from search */}
      {loaded && filtered.length === 0 && invoices.length > 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No invoices match your search
        </div>
      )}

    </div>
  );
}
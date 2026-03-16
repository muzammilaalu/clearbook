import { useState, useRef } from 'react';
import { Upload, FileUp, CheckCircle, XCircle, Paperclip, Trash2, Download, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { salesService } from '../services/api';

export default function SalesAttachmentUpload({ businessId, showNotification }) {
  const [rows,      setRows]      = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results,   setResults]   = useState(null);
  const excelRef = useRef();

  // ── Parse Excel mapping file ──────────────────────────────────────────
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb   = XLSX.read(ev.target.result, { type: 'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const parsed = data
        .filter(r => r['invoice_ref'] || r['invoice_id'] || r['Invoice Ref'] || r['Invoice ID'])
        .map((r, i) => ({
          id:               i,
          // Support both invoice_ref and invoice_id columns
          invoice_ref:      (r['invoice_ref'] || r['Invoice Ref'] || r['invoice_id'] || r['Invoice ID'] || '').toString().trim(),
          file_name:        (r['file_name']   || r['File Name']   || '').toString().trim(),
          file:             null,
          file_data_base64: null,
          status:           'pending',
          error:            '',
        }));

      setRows(parsed);
      setResults(null);
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Attach actual file to a row ───────────────────────────────────────
  const handleFileAttach = (rowId, file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setRows(prev => prev.map(r =>
        r.id === rowId
          ? { ...r, file, file_name: file.name, file_data_base64: base64, status: 'ready' }
          : r
      ));
    };
    reader.readAsDataURL(file);
  };

  const removeRow = (rowId) => setRows(prev => prev.filter(r => r.id !== rowId));

  // ── Upload all ready rows ─────────────────────────────────────────────
  const handleUpload = async () => {
    if (!businessId) { showNotification('error', 'No business selected.'); return; }
    const readyRows = rows.filter(r => r.status === 'ready' && r.file_data_base64);
    if (readyRows.length === 0) { showNotification('error', 'Please attach files first.'); return; }

    setUploading(true);
    setRows(prev => prev.map(r => r.status === 'ready' ? { ...r, status: 'uploading' } : r));

    try {
      const payload = readyRows.map(r => ({
        invoice_ref:      r.invoice_ref,
        file_name:        r.file_name,
        file_data_base64: r.file_data_base64,
      }));

      const result = await salesService.uploadSalesAttachments(businessId, payload);

      const errorMap = {};
      (result.errors || []).forEach(e => {
        errorMap[e.invoice_ref + '_' + e.file_name] = e.error;
      });

      setRows(prev => prev.map(r => {
        const key = r.invoice_ref + '_' + r.file_name;
        if (r.status !== 'uploading') return r;
        return errorMap[key]
          ? { ...r, status: 'error', error: errorMap[key] }
          : { ...r, status: 'success' };
      }));

      setResults(result.summary);
      showNotification(
        result.summary.failed === 0 ? 'success' : 'error',
        `✅ ${result.summary.created} uploaded, ❌ ${result.summary.failed} failed`
      );
    } catch {
      showNotification('error', 'Upload failed.');
      setRows(prev => prev.map(r =>
        r.status === 'uploading' ? { ...r, status: 'error', error: 'Upload failed' } : r
      ));
    } finally {
      setUploading(false);
    }
  };

  // ── Download template ─────────────────────────────────────────────────
  // invoice_ref column mein: invoice ID (number) ya reference string dono chalega
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['invoice_ref', 'file_name'],
      // Sample: use invoice ID (number from ClearBooks)
      ['1',           'invoice1.pdf'],
      ['2',           'receipt.png'],
    ]);
    ws['!cols'] = [{ wch: 18 }, { wch: 22 }];
    ['A1', 'B1'].forEach(addr => {
      if (ws[addr]) ws[addr].s = {
        font:      { bold: true, color: { rgb: 'FFFFFF' } },
        fill:      { fgColor: { rgb: '3B82F6' } },
        alignment: { horizontal: 'center' },
      };
    });
    // Yellow highlight on sample rows
    ['A2','A3'].forEach(addr => {
      if (ws[addr]) ws[addr].s = { fill: { fgColor: { rgb: 'FFF3CD' } } };
    });
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'attachment_upload_template.xlsx');
  };

  const readyCount   = rows.filter(r => r.status === 'ready').length;
  const pendingCount = rows.filter(r => r.status === 'pending').length;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-rose-50 p-2.5 rounded-xl">
            <Paperclip className="text-rose-600" size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Upload Sales Attachments</h2>
            <p className="text-xs text-gray-500 mt-0.5">Attach files to invoices by invoice ID or reference</p>
          </div>
        </div>

        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Download size={13} />
          Download Template
        </button>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex gap-2">
        <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>invoice_ref</strong> column mein invoice ka <strong>ID number</strong> daalo (e.g. <code>1</code>, <code>2</code>).
          Invoice IDs Sales Attachments export se mil sakte hain.
        </p>
      </div>

      {/* Step 1 */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Step 1 — Upload mapping Excel
          <span className="text-xs font-normal text-gray-400 ml-2">(invoice_ref + file_name columns)</span>
        </p>
        <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl cursor-pointer transition-all">
          <FileUp className="text-gray-400" size={20} />
          <span className="text-sm text-gray-500">Click to upload mapping Excel (.xlsx / .csv)</span>
          <input
            ref={excelRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleExcelUpload}
          />
        </label>
      </div>

      {/* Step 2 */}
      {rows.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Step 2 — Attach files to each row
            <span className="text-xs font-normal text-gray-400 ml-2">
              ({readyCount} ready, {pendingCount} pending)
            </span>
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {rows.map(row => (
              <div
                key={row.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
                  row.status === 'success'   ? 'bg-green-50 border-green-200'   :
                  row.status === 'error'     ? 'bg-red-50 border-red-200'       :
                  row.status === 'ready'     ? 'bg-blue-50 border-blue-200'     :
                  row.status === 'uploading' ? 'bg-yellow-50 border-yellow-200' :
                                               'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {row.status === 'success'   && <CheckCircle size={16} className="text-green-600" />}
                  {row.status === 'error'     && <XCircle    size={16} className="text-red-600"   />}
                  {row.status === 'uploading' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                  {(row.status === 'pending' || row.status === 'ready') && <Paperclip size={16} className="text-gray-400" />}
                </div>

                <span className="font-mono text-xs bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-700 w-24 flex-shrink-0 truncate">
                  ID: {row.invoice_ref}
                </span>

                <span className="text-gray-600 flex-1 truncate text-xs">
                  {row.file_name || <span className="text-gray-400 italic">No file attached</span>}
                </span>

                {row.error && (
                  <span className="text-red-600 text-xs truncate max-w-40">{row.error}</span>
                )}

                {(row.status === 'pending' || row.status === 'ready') && (
                  <label className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 hover:border-blue-400 rounded-lg cursor-pointer text-xs text-gray-600 hover:text-blue-600 transition-colors flex-shrink-0">
                    <Upload size={12} />
                    {row.status === 'ready' ? 'Change' : 'Attach'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => e.target.files[0] && handleFileAttach(row.id, e.target.files[0])}
                    />
                  </label>
                )}

                {row.status !== 'uploading' && row.status !== 'success' && (
                  <button onClick={() => removeRow(row.id)} className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 */}
      {rows.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading || readyCount === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-md"
        >
          {uploading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading...</>
          ) : (
            <><Upload size={18} />Upload {readyCount} Attachment{readyCount !== 1 ? 's' : ''}</>
          )}
        </button>
      )}

      {/* Results */}
      {results && (
        <div className={`mt-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          results.failed === 0
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-amber-50 border border-amber-200 text-amber-800'
        }`}>
          {results.failed === 0 ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {results.created} uploaded successfully, {results.failed} failed out of {results.total}
        </div>
      )}

    </div>
  );
}
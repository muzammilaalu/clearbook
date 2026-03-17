import { useState, useRef } from 'react';
import { Upload, FileUp, CheckCircle, XCircle, Paperclip, Download, Info, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { salesService } from '../services/api';

export default function SalesAttachmentUpload({ businessId, showNotification }) {
  const [mappingRows,  setMappingRows]  = useState([]); // [{ invoice_id, file_name, file, status, error }]
  const [uploading,    setUploading]    = useState(false);
  const [results,      setResults]      = useState(null);
  const excelRef = useRef();
  const filesRef = useRef();

  // ── Step 1: Parse Excel mapping file ─────────────────────────────────
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb   = XLSX.read(ev.target.result, { type: 'array' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const parsed = data
        .filter(r => r['invoice_id'] || r['invoice_ref'])
        .map((r, i) => ({
          id:         i,
          invoice_id: (r['invoice_id'] || r['invoice_ref'] || '').toString().trim(),
          file_name:  (r['file_name']  || r['file_path']   || '').toString().trim().split(/[\\/]/).pop(), // sirf filename nikalo path se
          file:       null,
          file_data_base64: null,
          status:     'pending', // pending | matched | uploading | success | error
          error:      '',
        }));

      setMappingRows(parsed);
      setResults(null);
      showNotification('success', `${parsed.length} rows loaded from Excel`);
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Step 2: Select files — auto-match by filename ─────────────────────
  const handleFilesSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    // Build filename → file map (case-insensitive)
    const fileMap = {};
    selectedFiles.forEach(f => {
      fileMap[f.name.toLowerCase()] = f;
    });

    let matchCount = 0;

    const updatedRows = mappingRows.map(row => {
      const matchedFile = fileMap[row.file_name.toLowerCase()];
      if (!matchedFile) return row;

      // Convert to base64
      return { ...row, file: matchedFile, status: 'reading' };
    });

    setMappingRows(updatedRows);

    // Read all matched files as base64
    updatedRows.forEach((row, idx) => {
      if (!row.file || row.status !== 'reading') return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result.split(',')[1];
        matchCount++;
        setMappingRows(prev => prev.map((r, i) =>
          i === idx ? { ...r, file_data_base64: base64, status: 'matched' } : r
        ));
      };
      reader.readAsDataURL(row.file);
    });

    // Show unmatched warning
    const unmatchedRows = updatedRows.filter(r => r.status === 'pending');
    if (unmatchedRows.length > 0) {
      showNotification('error', `⚠️ ${unmatchedRows.length} files not found: ${unmatchedRows.map(r => r.file_name).join(', ')}`);
    }
  };

  // ── Step 3: Upload all matched rows ──────────────────────────────────
  const handleUpload = async () => {
    if (!businessId) { showNotification('error', 'No business selected.'); return; }

    const readyRows = mappingRows.filter(r => r.status === 'matched' && r.file_data_base64);
    if (readyRows.length === 0) {
      showNotification('error', 'No matched files to upload. Please select files first.');
      return;
    }

    setUploading(true);
    setMappingRows(prev => prev.map(r =>
      r.status === 'matched' ? { ...r, status: 'uploading' } : r
    ));

    try {
      const payload = readyRows.map(r => ({
        invoice_ref:      r.invoice_id,
        file_name:        r.file_name,
        file_data_base64: r.file_data_base64,
      }));

      const result = await salesService.uploadSalesAttachments(businessId, payload);

      // Update statuses
      const errorMap = {};
      (result.errors || []).forEach(e => {
        errorMap[e.invoice_ref + '_' + e.file_name] = e.error;
      });

      setMappingRows(prev => prev.map(r => {
        if (r.status !== 'uploading') return r;
        const key = r.invoice_id + '_' + r.file_name;
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
      setMappingRows(prev => prev.map(r =>
        r.status === 'uploading' ? { ...r, status: 'error', error: 'Upload failed' } : r
      ));
    } finally {
      setUploading(false);
    }
  };

  // ── Download template ──────────────────────────────────────────────────
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['invoice_id', 'file_name'],
      ['1',          'invoice1.pdf'],
      ['2',          'receipt.png'],
      ['3',          'statement.xlsx'],
    ]);
    ws['!cols'] = [{ wch: 14 }, { wch: 24 }];
    ['A1','B1'].forEach(addr => {
      if (ws[addr]) ws[addr].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: 'E11D48' } },
        alignment: { horizontal: 'center' },
      };
    });
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'attachment_mapping_template.xlsx');
  };

  // ── Reset ──────────────────────────────────────────────────────────────
  const handleReset = () => {
    setMappingRows([]);
    setResults(null);
    if (excelRef.current) excelRef.current.value = '';
    if (filesRef.current) filesRef.current.value = '';
  };

  const matchedCount  = mappingRows.filter(r => r.status === 'matched').length;
  const pendingCount  = mappingRows.filter(r => r.status === 'pending').length;
  const successCount  = mappingRows.filter(r => r.status === 'success').length;
  const errorCount    = mappingRows.filter(r => r.status === 'error').length;

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
            <p className="text-xs text-gray-500 mt-0.5">Excel mapping + folder upload</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
            <Download size={13} />
            Template
          </button>
          {mappingRows.length > 0 && (
            <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors">
              <RefreshCw size={13} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex gap-2">
        <Info size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-1">How it works:</p>
          <ol className="space-y-0.5 list-decimal list-inside text-blue-700">
            <li>Download template → fill <strong>invoice_id</strong> and <strong>file_name</strong></li>
            <li>Upload the filled Excel mapping file</li>
            <li>Select the <strong>folder</strong> containing all attachment files</li>
            <li>Files auto-match by name → click Upload</li>
          </ol>
        </div>
      </div>

      {/* Step 1 — Excel mapping */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-rose-600 text-white rounded-full text-xs mr-2">1</span>
          Upload Excel Mapping File
        </p>
        <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50 rounded-xl cursor-pointer transition-all">
          <FileUp className="text-gray-400" size={18} />
          <span className="text-sm text-gray-500">
            {mappingRows.length > 0
              ? `✅ ${mappingRows.length} rows loaded — click to change`
              : 'Click to upload mapping Excel (.xlsx / .csv)'}
          </span>
          <input ref={excelRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} />
        </label>
      </div>

      {/* Step 2 — Select files */}
      {mappingRows.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-rose-600 text-white rounded-full text-xs mr-2">2</span>
            Select Folder Containing Files
            <span className="text-xs font-normal text-gray-400 ml-2">(folder upload — all files auto-matched)</span>
          </p>
          <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50 rounded-xl cursor-pointer transition-all">
            <Upload className="text-gray-400" size={18} />
            <span className="text-sm text-gray-500">
              {matchedCount > 0
                ? `✅ ${matchedCount} files matched, ${pendingCount} not found`
                : 'Click to select a FOLDER — all files will auto-match by name'}
            </span>
            <input ref={filesRef} type="file" multiple webkitdirectory="" className="hidden" onChange={handleFilesSelect} />
          </label>
        </div>
      )}

      {/* Rows table */}
      {mappingRows.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-rose-600 text-white rounded-full text-xs mr-2">3</span>
            Mapping Preview
          </p>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500">
              <span className="col-span-3">Invoice ID</span>
              <span className="col-span-5">File Name</span>
              <span className="col-span-4">Status</span>
            </div>

            {/* Rows — max 5 visible, rest scrollable */}
            <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-100">
              {mappingRows.map(row => (
                <div key={row.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-gray-50">
                  <span className="col-span-3 font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded w-fit">
                    #{row.invoice_id}
                  </span>
                  <span className="col-span-5 text-xs text-gray-600 truncate">{row.file_name}</span>
                  <span className="col-span-4">
                    {row.status === 'pending'   && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">⏳ Waiting</span>}
                    {row.status === 'reading'   && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">📖 Reading...</span>}
                    {row.status === 'matched'   && <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">✅ Matched</span>}
                    {row.status === 'uploading' && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">⬆️ Uploading...</span>}
                    {row.status === 'success'   && <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">✅ Uploaded</span>}
                    {row.status === 'error'     && <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full truncate" title={row.error}>❌ {row.error.substring(0, 30)}{row.error.length > 30 ? '...' : ''}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mt-2 flex-wrap">
            {matchedCount > 0  && <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">✅ {matchedCount} matched</span>}
            {pendingCount > 0  && <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">⏳ {pendingCount} not found</span>}
            {successCount > 0  && <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">⬆️ {successCount} uploaded</span>}
            {errorCount > 0    && <span className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full">❌ {errorCount} failed</span>}
          </div>
        </div>
      )}

      {/* Upload button */}
      {matchedCount > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-md"
        >
          {uploading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading {matchedCount} files...</>
          ) : (
            <><Upload size={18} />Upload {matchedCount} Attachment{matchedCount !== 1 ? 's' : ''}</>
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
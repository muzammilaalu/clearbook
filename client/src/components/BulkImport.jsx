import { useState, useRef }     from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import Papa                      from 'papaparse';
import * as XLSX                 from 'xlsx';
import { accountCodeService }    from '../services/api';
import { validateRow }           from './utils/bulkValidate';
import { parseRow }              from './utils/bulkParse';
import { TYPE_CONFIG }           from './utils/bulkConfig';
import BulkHeader                from './bulk/BulkHeader';
import BulkUploadBox             from './bulk/BulkUploadBox';
import BulkColumnInfo            from './bulk/BulkColumnInfo';
import BulkStockHelper           from './bulk/BulkStockHelper';
import BulkInvalidTable          from './bulk/BulkInvalidTable';
import BulkPreviewTable          from './bulk/BulkPreviewTable';

// ── Main Component ────────────────────────────────────────────────────────
export default function BulkImport({ onImport, loading }) {
  const [importType,  setImportType]  = useState('customers');
  const [validRows,   setValidRows]   = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [fileName,    setFileName]    = useState('');
  const [preview,     setPreview]     = useState(false);
  const fileInputRef                  = useRef();

  const config = TYPE_CONFIG[importType];

  // Account codes + VAT rates for Stock Items helper
  const [showHelper,    setShowHelper]    = useState(false);
  const [accountCodes,  setAccountCodes]  = useState([]);
  const [vatRates,      setVatRates]      = useState([]);
  const [helperLoading, setHelperLoading] = useState(false);

  const fetchHelper = async () => {
    if (!window.__businessId__) return;
    setHelperLoading(true);
    try {
      const [codes, vats] = await Promise.all([
        accountCodeService.fetchAccountCodes(window.__businessId__),
        accountCodeService.fetchVatRates(window.__businessId__),
      ]);
      setAccountCodes(Array.isArray(codes) ? codes : []);
      setVatRates(Array.isArray(vats) ? vats : []);
      setShowHelper(true);
    } catch (e) {
      alert('Could not fetch account codes. Make sure you are logged in.');
    } finally {
      setHelperLoading(false);
    }
  };

  const handleTypeChange = (newType) => {
    setImportType(newType);
    setValidRows([]); setInvalidRows([]); setFileName(''); setPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setValidRows([]); setInvalidRows([]); setPreview(false);

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
        complete: (r) => processRows(r.data.filter(row => {
          const vals = Object.values(row).map(v => v?.toString().trim()).filter(Boolean);
          if (vals.length === 0) return false;
          if (importType === 'journals') {
            const ref  = row['journal_ref']?.toString().trim();
            const date = row['accounting_date']?.toString().trim();
            const acct = row['account_code']?.toString().trim();
            const amt  = row['amount']?.toString().trim();
            return !!(ref || date || acct || amt);
          }
          return true;
        })),
        error: (e) => alert(`CSV error: ${e.message}`),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const wb    = XLSX.read(ev.target.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        processRows(XLSX.utils.sheet_to_json(sheet, { defval: '' }).filter(row => {
          const vals = Object.values(row).map(v => v?.toString().trim()).filter(Boolean);
          if (vals.length === 0) return false;
          // For journals: skip rows where all key columns are empty
          if (importType === 'journals') {
            const ref   = row['journal_ref']?.toString().trim();
            const date  = row['accounting_date']?.toString().trim();
            const acct  = row['account_code']?.toString().trim();
            const amt   = row['amount']?.toString().trim();
            return !!(ref || date || acct || amt);
          }
          return true;
        }));
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Only .csv, .xlsx, or .xls files are supported.');
    }
  };

  const processRows = (rows) => {
    // ── Journals: group rows by journal_ref ────────────────────────────────
    if (importType === 'journals') {
      const grouped = {};
      const invalid = [];

      rows.forEach((row, i) => {
        const parsed = parseRow(row, i + 2, 'journals');
        const errors = validateRow(parsed, 'journals');
        if (errors.length > 0) {
          invalid.push({ row: parsed, errors });
          return;
        }
        const key = parsed.journal_ref?.toString().trim() ||
                    `${parsed.accounting_date}_${parsed.description}`;
        if (!grouped[key]) {
          grouped[key] = {
            journal_ref:    parsed.journal_ref || key,
            accountingDate: parsed.accounting_date,
            description:    parsed.description || '',
            lines: [],
          };
        }
        grouped[key].lines.push({
          accountCode:  parsed.account_code,
          amount:       parseFloat(parsed.amount),
          description:  parsed.line_description || '',
        });
      });

      // Send all journals to ClearBooks API — let API return actual errors
      const valid = Object.values(grouped);

      setValidRows(valid);
      setInvalidRows(invalid);
      setPreview(true);
      return;
    }

    // ── Customers / Suppliers / Stock Items ───────────────────────────────
    const valid = [], invalid = [];
    rows.forEach((row, i) => {
      const parsed = parseRow(row, i + 2, importType);
      const errors = validateRow(parsed, importType);
      if (errors.length > 0) invalid.push({ row: parsed, errors });
      else valid.push(parsed);
    });
    setValidRows(valid); setInvalidRows(invalid); setPreview(true);
  };

  const handleImport = async () => {
    // Pass both validRows AND invalidRows to DashboardPage
    // DashboardPage will combine frontend-invalid + API-failed into one Excel
    await onImport(importType, validRows, invalidRows);
    setValidRows([]); setInvalidRows([]); setFileName(''); setPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">

      <BulkHeader importType={importType} config={config} onTypeChange={handleTypeChange} />

      <BulkUploadBox fileName={fileName} config={config} fileInputRef={fileInputRef} onFileChange={handleFileChange} />

      <BulkColumnInfo importType={importType} config={config} />

      {/* Stock Items Helper — Valid Account Codes & VAT Rates */}
      {importType === 'stockItems' && (
        <BulkStockHelper
          showHelper={showHelper}
          accountCodes={accountCodes}
          vatRates={vatRates}
          helperLoading={helperLoading}
          onFetch={fetchHelper}
        />
      )}

      {/* Summary badges */}
      {preview && (
        <div className="mt-4 flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle size={18} className="text-green-600" />
            <span className="font-semibold text-green-700">{validRows.length} valid — will be imported</span>
          </div>
          {invalidRows.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <XCircle size={18} className="text-red-600" />
              <span className="font-semibold text-red-700">{invalidRows.length} invalid — will be skipped</span>
            </div>
          )}
        </div>
      )}

      {invalidRows.length > 0 && (
        <BulkInvalidTable invalidRows={invalidRows} importType={importType} />
      )}

      {validRows.length > 0 && (
        <BulkPreviewTable
          validRows={validRows}
          invalidRows={invalidRows}
          importType={importType}
          config={config}
          loading={loading}
          onImport={handleImport}
        />
      )}

    </div>
  );
}
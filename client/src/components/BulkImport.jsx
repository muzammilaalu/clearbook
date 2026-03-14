import { useState, useRef } from 'react';
import { CheckCircle, XCircle, Upload, FileSpreadsheet, Info, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { accountCodeService } from '../services/api';
import { validateRow } from './utils/bulkValidate';
import { parseRow } from './utils/bulkParse';
import { TYPE_CONFIG } from './utils/bulkConfig';
import BulkHeader from './bulk/BulkHeader';
import BulkUploadBox from './bulk/BulkUploadBox';
import BulkColumnInfo from './bulk/BulkColumnInfo';
import BulkStockHelper from './bulk/BulkStockHelper';
import BulkInvalidTable from './bulk/BulkInvalidTable';
import BulkPreviewTable from './bulk/BulkPreviewTable';

export default function BulkImport({ onImport, loading }) {
  const [importType, setImportType] = useState('customers');
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState(false);
  const fileInputRef = useRef();

  const config = TYPE_CONFIG[importType];

  const [showHelper, setShowHelper] = useState(false);
  const [accountCodes, setAccountCodes] = useState([]);
  const [vatRates, setVatRates] = useState([]);
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
    setValidRows([]);
    setInvalidRows([]);
    setFileName('');
    setPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setValidRows([]);
    setInvalidRows([]);
    setPreview(false);

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
        complete: (r) => processRows(r.data.filter(row => {
          const vals = Object.values(row).map(v => v?.toString().trim()).filter(Boolean);
          if (vals.length === 0) return false;
          if (importType === 'journals') {
            const ref = row['journal_ref']?.toString().trim();
            const date = row['accounting_date']?.toString().trim();
            const acct = row['account_code']?.toString().trim();
            const amt = row['amount']?.toString().trim();
            return !!(ref || date || acct || amt);
          }
          return true;
        })),
        error: (e) => alert(`CSV error: ${e.message}`),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        processRows(XLSX.utils.sheet_to_json(sheet, { defval: '' }).filter(row => {
          const vals = Object.values(row).map(v => v?.toString().trim()).filter(Boolean);
          if (vals.length === 0) return false;
          if (importType === 'journals') {
            const ref = row['journal_ref']?.toString().trim();
            const date = row['accounting_date']?.toString().trim();
            const acct = row['account_code']?.toString().trim();
            const amt = row['amount']?.toString().trim();
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
            journal_ref: parsed.journal_ref || key,
            accountingDate: parsed.accounting_date,
            description: parsed.description || '',
            lines: [],
          };
        }
        grouped[key].lines.push({
          accountCode: parsed.account_code,
          amount: parseFloat(parsed.amount),
          description: parsed.line_description || '',
        });
      });

      const valid = Object.values(grouped);
      setValidRows(valid);
      setInvalidRows(invalid);
      setPreview(true);
      return;
    }

    const valid = [], invalid = [];
    rows.forEach((row, i) => {
      const parsed = parseRow(row, i + 2, importType);
      const errors = validateRow(parsed, importType);
      if (errors.length > 0) invalid.push({ row: parsed, errors });
      else valid.push(parsed);
    });
    setValidRows(valid);
    setInvalidRows(invalid);
    setPreview(true);
  };

  const handleImport = async () => {
    await onImport(importType, validRows, invalidRows);
    setValidRows([]);
    setInvalidRows([]);
    setFileName('');
    setPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const importSteps = [
    { num: 1, title: "Select Import Type", desc: "Choose the data type you want to import" },
    { num: 2, title: "Upload File", desc: "Select your Excel or CSV file" },
    { num: 3, title: "Validate Data", desc: "Review and fix any validation errors" },
    { num: 4, title: "Import Records", desc: "Confirm and complete the import" }
  ];

  const tips = [
    "Ensure your file has the correct column headers as shown below",
    "Remove any empty rows or columns before uploading",
    "Use the template format to avoid validation errors",
    "Large files may take a few moments to process"
  ];

  const supportedFormats = [
    { ext: ".xlsx", desc: "Microsoft Excel Workbook" },
    { ext: ".xls", desc: "Legacy Excel Format" },
    { ext: ".csv", desc: "Comma-Separated Values" }
  ];

  return (
    <div className="space-y-6">

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <BulkHeader importType={importType} config={config} onTypeChange={handleTypeChange} />
            <BulkUploadBox fileName={fileName} config={config} fileInputRef={fileInputRef} onFileChange={handleFileChange} />
            <BulkColumnInfo importType={importType} config={config} />

            {importType === 'stockItems' && (
              <BulkStockHelper
                showHelper={showHelper}
                accountCodes={accountCodes}
                vatRates={vatRates}
                helperLoading={helperLoading}
                onFetch={fetchHelper}
              />
            )}
          </div>

          {preview && (
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border border-green-200 rounded-xl shadow-sm">
                <CheckCircle size={20} className="text-green-600" />
                <span className="font-semibold text-green-700">{validRows.length} valid — ready to import</span>
              </div>
              {invalidRows.length > 0 && (
                <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                  <XCircle size={20} className="text-red-600" />
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

        <div className="space-y-6">

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-blue-600" size={20} />
              <h3 className="font-semibold text-blue-900">Import Process</h3>
            </div>
            <div className="space-y-4">
              {importSteps.map((step) => (
                <div key={step.num} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                    {step.num}
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 text-sm">{step.title}</p>
                    <p className="text-xs text-blue-700 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-amber-600" size={20} />
              <h3 className="font-semibold text-gray-900">Tips for Success</h3>
            </div>
            <ul className="space-y-2.5">
              {tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <FileSpreadsheet className="text-emerald-600" size={20} />
              <h3 className="font-semibold text-gray-900">Supported Formats</h3>
            </div>
            <div className="space-y-3">
              {supportedFormats.map((format, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-mono text-sm font-semibold text-gray-900">{format.ext}</span>
                  <span className="text-xs text-gray-600">{format.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-md">
            <h3 className="font-semibold text-gray-900 mb-3">Data Validation Rules</h3>
            <div className="space-y-2 text-xs text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>All required fields must be present</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Email addresses must be valid format</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Numeric fields must contain valid numbers</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Dates must be in correct format</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

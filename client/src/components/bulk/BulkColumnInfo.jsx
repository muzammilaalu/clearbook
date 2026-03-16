import { Info, Download } from "lucide-react";
import * as XLSX from "xlsx";

// ── Template definitions per type ─────────────────────────────────────────
// required: true → yellow highlight + * in header
const TEMPLATES = {
  customers: {
    columns: [
      { key: 'company_name',   label: 'company_name',   required: true  },
      { key: 'contact_name',   label: 'contact_name',   required: false },
      { key: 'email',          label: 'email',          required: false },
      { key: 'phone1',         label: 'phone1',         required: false },
      { key: 'vat_number',     label: 'vat_number',     required: false },
      { key: 'building',       label: 'building',       required: false },
      { key: 'address1',       label: 'address1',       required: false },
      { key: 'address2',       label: 'address2',       required: false },
      { key: 'town',           label: 'town',           required: false },
      { key: 'county',         label: 'county',         required: false },
      { key: 'postcode',       label: 'postcode',       required: false },
      { key: 'country',        label: 'country',        required: false },
      { key: 'company_number', label: 'company_number', required: false },
    ],
    sampleRow: {
      company_name: 'Acme Ltd', contact_name: 'John Smith',
      email: 'john@acme.com', phone1: '07700900000',
      vat_number: 'GB123456789', building: '10',
      address1: 'High Street', address2: '', town: 'London',
      county: 'Greater London', postcode: 'SW1A 1AA',
      country: 'GB', company_number: '12345678',
    },
  },
  suppliers: {
    columns: [
      { key: 'company_name',   label: 'company_name',   required: true  },
      { key: 'contact_name',   label: 'contact_name',   required: false },
      { key: 'email',          label: 'email',          required: false },
      { key: 'phone1',         label: 'phone1',         required: false },
      { key: 'vat_number',     label: 'vat_number',     required: false },
      { key: 'building',       label: 'building',       required: false },
      { key: 'address1',       label: 'address1',       required: false },
      { key: 'address2',       label: 'address2',       required: false },
      { key: 'town',           label: 'town',           required: false },
      { key: 'county',         label: 'county',         required: false },
      { key: 'postcode',       label: 'postcode',       required: false },
      { key: 'country',        label: 'country',        required: false },
      { key: 'company_number', label: 'company_number', required: false },
    ],
    sampleRow: {
      company_name: 'Supplier Co', contact_name: 'Jane Doe',
      email: 'jane@supplier.com', phone1: '07700911111',
      vat_number: 'GB987654321', building: '5',
      address1: 'Park Lane', address2: '', town: 'Manchester',
      county: 'Greater Manchester', postcode: 'M1 1AA',
      country: 'GB', company_number: '87654321',
    },
  },
  stockItems: {
    columns: [
      { key: 'name',               label: 'name',               required: true  },
      { key: 'type',               label: 'type',               required: true  },
      { key: 'sku',                label: 'sku',                required: false },
      { key: 'description',        label: 'description',        required: false },
      { key: 'sale_price',         label: 'sale_price',         required: false },
      { key: 'sales_account',      label: 'sales_account',      required: false },
      { key: 'sale_vat_rate',      label: 'sale_vat_rate',      required: false },
      { key: 'cost_price',         label: 'cost_price',         required: false },
      { key: 'purchases_account',  label: 'purchases_account',  required: false },
      { key: 'purchases_vat_rate', label: 'purchases_vat_rate', required: false },
      { key: 'is_stock_item',      label: 'is_stock_item',      required: false },
    ],
    sampleRow: {
      name: 'Widget A', type: 'both', sku: 'WGT-001',
      description: 'A sample widget', sale_price: '10.00',
      sales_account: '4000', sale_vat_rate: 'standard',
      cost_price: '5.00', purchases_account: '5000',
      purchases_vat_rate: 'standard', is_stock_item: 'true',
    },
  },
  journals: {
    columns: [
      { key: 'journal_ref',      label: 'journal_ref',      required: true  },
      { key: 'accounting_date',  label: 'accounting_date',  required: true  },
      { key: 'account_code',     label: 'account_code',     required: true  },
      { key: 'amount',           label: 'amount',           required: true  },
      { key: 'description',      label: 'description',      required: false },
      { key: 'line_description', label: 'line_description', required: false },
    ],
    sampleRow: [
      { journal_ref: 'J001', accounting_date: '2026-03-14', account_code: '7502001', amount: 500,   description: 'March Salary',  line_description: 'Bank debit'   },
      { journal_ref: 'J001', accounting_date: '2026-03-14', account_code: '8501001', amount: -500,  description: 'March Salary',  line_description: 'Supplier credit' },
      { journal_ref: 'J002', accounting_date: '2026-03-14', account_code: '8502001', amount: 200,   description: 'VAT Adjustment',line_description: 'VAT debit'    },
      { journal_ref: 'J002', accounting_date: '2026-03-14', account_code: '9001002', amount: -200,  description: 'VAT Adjustment',line_description: 'Retained earnings' },
    ],
  },
};

// ── Download template ──────────────────────────────────────────────────────
function downloadTemplate(importType) {
  const tmpl = TEMPLATES[importType];
  if (!tmpl) return;

  const wb   = XLSX.utils.book_new();
  const cols  = tmpl.columns;
  const headers = cols.map(c => c.required ? `${c.label} *` : c.label);

  // Build rows array
  const dataRows = Array.isArray(tmpl.sampleRow)
    ? tmpl.sampleRow.map(r => cols.map(c => r[c.key] ?? ''))
    : [cols.map(c => tmpl.sampleRow[c.key] ?? '')];

  const wsData = [headers, ...dataRows];
  const ws     = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = cols.map(() => ({ wch: 22 }));

  // Style header row
  const reqFill  = { fgColor: { rgb: 'FFF3CD' } }; // yellow — required
  const optFill  = { fgColor: { rgb: 'E8F4FD' } }; // light blue — optional
  const boldFont = { bold: true };

  cols.forEach((col, i) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!ws[addr]) return;
    ws[addr].s = {
      font:      boldFont,
      fill:      col.required ? reqFill : optFill,
      alignment: { horizontal: 'center' },
      border: {
        bottom: { style: 'medium', color: { rgb: col.required ? 'F59E0B' : '93C5FD' } },
      },
    };
  });

  XLSX.utils.book_append_sheet(wb, ws, `${importType}_template`);
  XLSX.writeFile(wb, `${importType}_template.xlsx`);
}

// ── Component ──────────────────────────────────────────────────────────────
export default function BulkColumnInfo({ importType, config }) {
  if (!config || !config.requiredColumns) return null;

  const tmpl = TEMPLATES[importType];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2">
          <Info className="text-slate-600 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">Required Columns</h3>
            <p className="text-xs text-slate-600">Your file must include these column headers.</p>
          </div>
        </div>

        {/* Download Template Button */}
        {tmpl && (
          <button
            onClick={() => downloadTemplate(importType)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            <Download size={13} />
            Download Template
          </button>
        )}
      </div>

      {/* Column chips */}
      <div className="flex flex-wrap gap-2">
        {config.requiredColumns.map((col, idx) => (
          <span
            key={idx}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 shadow-sm"
          >
            {col}
          </span>
        ))}
      </div>

      {/* Legend */}
      {tmpl && (
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-400 inline-block"></span>
            Required field (marked with *)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300 inline-block"></span>
            Optional field
          </span>
        </div>
      )}

      {/* Journals tip */}
      {importType === "journals" && (
        <div className="mt-3 text-blue-700 text-xs font-medium bg-blue-50 border border-blue-200 p-3 rounded-lg">
          💡 Each <code>journal_ref</code> groups multiple lines into one journal entry.
          Total of all <code>amount</code> values must equal <strong>0</strong>.
        </div>
      )}

    </div>
  );
}
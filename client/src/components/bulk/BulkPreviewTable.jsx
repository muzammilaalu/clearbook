import { CheckCircle } from 'lucide-react';

export default function BulkPreviewTable({ validRows, invalidRows, importType, config, loading, onImport }) {
  return (
    /* Valid rows preview */
    <div className="mt-4">
      <p className="font-medium text-gray-700 mb-2">
        ✅ {validRows.length} {config.label.toLowerCase()} ready to import:
      </p>
      <div className="overflow-x-auto max-h-64 border rounded-lg text-sm">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {importType === 'stockItems'
                ? ['#', 'Name', 'SKU', 'Type', 'Sale Price', 'Cost Price'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium whitespace-nowrap">{h}</th>
                  ))
                : importType === 'journals'
                ? ['#', 'Ref', 'Date', 'Description', 'Lines', 'Sum'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium whitespace-nowrap">{h}</th>
                  ))
                : ['#', 'Name', 'Email', 'Phone', 'VAT No', 'Town', 'Postcode', 'Country'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium whitespace-nowrap">{h}</th>
                  ))
              }
            </tr>
          </thead>
          <tbody>
            {validRows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                {importType === 'journals' ? (
                  <>
                    <td className="px-3 py-2 font-medium">{r.journal_ref || '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{r.accountingDate || '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{r.description || '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{r.lines?.length ?? 0} lines</td>
                    <td className="px-3 py-2 font-medium text-green-700">
                      {r.lines?.reduce((s, l) => s + l.amount, 0).toFixed(2)}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    {importType === 'stockItems' ? (
                      <>
                        <td className="px-3 py-2 text-gray-600">{r.sku || '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{r.type || '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{r.sale_price || '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{r.cost_price || '—'}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2 text-gray-600">{r.email || '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{r.phone || '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{r.vatNumber || '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{r.address_town || '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{r.address_postcode || '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{r.address_countryCode || '—'}</td>
                      </>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={onImport}
        disabled={loading}
        className={`mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 ${config.btnColor} disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors`}
      >
        {loading
          ? `Importing ${validRows.length} ${config.label.toLowerCase()}...`
          : <><CheckCircle size={20} /> Import {validRows.length} Valid {config.label} to ClearBooks</>
        }
      </button>

      {invalidRows.length > 0 && (
        <p className="mt-2 text-sm text-center text-orange-600">
          ⚠️ After import {invalidRows.length} invalid row(s) Excel will be download automatically...
        </p>
      )}
    </div>
  );
}
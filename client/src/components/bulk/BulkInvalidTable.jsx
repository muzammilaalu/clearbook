import { AlertCircle } from 'lucide-react';

export default function BulkInvalidTable({ invalidRows, importType }) {
  return (
    /* Invalid rows table */
    <div className="mt-4 border border-red-200 rounded-lg overflow-hidden">
      <div className="bg-red-50 px-4 py-2 flex items-center justify-between">
        <p className="font-semibold text-red-700 flex items-center gap-1">
          <AlertCircle size={16} /> Invalid Rows — will NOT be imported
        </p>
        <span className="text-xs text-red-500 italic">
          These rows will be included in the error Excel after import
        </span>
      </div>
      <div className="overflow-x-auto max-h-48 text-sm">
        <table className="w-full">
          <thead className="bg-red-50">
            <tr>
              {['Row #', 'Name', 'Errors Found'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-red-700 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invalidRows.map(({ row, errors }, i) => (
              <tr key={i} className="border-t border-red-100">
                <td className="px-3 py-2 text-gray-500">{row._rowNum || '—'}</td>
                <td className="px-3 py-2 font-medium">
                  {importType === 'journals'
                    ? (row.journal_ref || row.accounting_date || '(empty)')
                    : (row.name || '(empty)')
                  }
                </td>
                <td className="px-3 py-2">
                  {errors.map((err, j) => (
                    <span key={j} className="inline-block bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded mr-1 mb-1">
                      {err}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
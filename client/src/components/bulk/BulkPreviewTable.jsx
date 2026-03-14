import { CheckCircle, Upload } from "lucide-react";

export default function BulkPreviewTable({
  validRows = [],
  importType,
  config,
  loading,
  onImport
}) {

  const renderCell = (row, col) => {
    if (importType === 'journals') {
      if (col === 'journal_ref') return row.journal_ref || '-';
      if (col === 'accounting_date') return row.accountingDate || '-';
      if (col === 'description') return row.description || '-';
      if (col === 'lines') return `${row.lines?.length || 0} lines`;
    }

    return row?.[col] !== undefined && row?.[col] !== null && row?.[col] !== ''
      ? String(row[col])
      : '-';
  };

  const displayColumns =
    importType === 'journals'
      ? ['journal_ref','accounting_date','description','lines']
      : config?.requiredColumns?.slice(0,5) || [];

  return (
    <div className="bg-white rounded-xl shadow-md border border-green-200 overflow-hidden">

      <div className="bg-green-50 px-6 py-4 border-b border-green-200">

        <div className="flex items-center justify-between">

          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="text-green-600" size={20} />
              <h3 className="font-semibold text-green-900">
                Preview Valid Rows
              </h3>
            </div>

            <p className="text-sm text-green-700">
              {validRows.length} rows ready to import
            </p>
          </div>

          <button
            onClick={onImport}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >

            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Import {validRows.length} Rows</span>
              </>
            )}

          </button>

        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-green-100 border-b border-green-200">
            <tr>

              <th className="px-4 py-3 text-left font-semibold text-green-900">
                #
              </th>

              {displayColumns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 text-left font-semibold text-green-900">
                  {col}
                </th>
              ))}

            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">

            {validRows.slice(0,10).map((row, idx) => (

              <tr key={idx} className="hover:bg-green-50">

                <td className="px-4 py-3 text-gray-500 font-medium">
                  {idx + 1}
                </td>

                {displayColumns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-3 text-gray-700">
                    {renderCell(row, col)}
                  </td>
                ))}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {validRows.length > 10 && (
        <div className="bg-gray-50 px-6 py-3 text-center text-sm text-gray-600 border-t border-gray-200">
          Showing first 10 of {validRows.length} rows
        </div>
      )}

    </div>
  );
}
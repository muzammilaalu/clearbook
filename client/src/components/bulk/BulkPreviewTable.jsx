import { useState } from "react";
import { CheckCircle, Upload, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default function BulkPreviewTable({
  validRows = [],
  importType,
  config,
  loading,
  onImport
}) {
  const [page, setPage] = useState(1);

  const totalPages  = Math.ceil(validRows.length / PAGE_SIZE);
  const start       = (page - 1) * PAGE_SIZE;
  const pageRows    = validRows.slice(start, start + PAGE_SIZE);
  const previewColumns = config?.previewColumns || [];

  const renderCell = (row, col) => {
    if (col === 'lines')           return `${row.lines?.length || 0} lines`;
    if (col === 'accounting_date') return row.accountingDate || row.accounting_date || '-';
    const val = row?.[col];
    if (val === undefined || val === null || val === '') return '-';
    return String(val);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-green-200 overflow-hidden mt-4">

      {/* Header */}
      <div className="bg-green-50 px-6 py-4 border-b border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="text-green-600" size={20} />
              <h3 className="font-semibold text-green-900">Preview Valid Rows</h3>
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-100 border-b border-green-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-green-900">#</th>
              {previewColumns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 text-left font-semibold text-green-900">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {pageRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-green-50">
                <td className="px-4 py-3 text-gray-500 font-medium">
                  {start + idx + 1}
                </td>
                {previewColumns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-3 text-gray-700">
                    {renderCell(row, col.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">

          {/* Info */}
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{start + 1}–{Math.min(start + PAGE_SIZE, validRows.length)}</span> of <span className="font-medium">{validRows.length}</span> rows
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-2">

            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
              Prev
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={idx} className="px-2 text-gray-400 text-sm">...</span>
                ) : (
                  <button
                    key={idx}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                      page === p
                        ? 'bg-green-600 text-white'
                        : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={15} />
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
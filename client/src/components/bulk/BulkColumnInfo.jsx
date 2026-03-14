import { Info } from "lucide-react";

export default function BulkColumnInfo({ importType, config }) {

  if (!config || !config.requiredColumns) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">

      <div className="flex items-start gap-2 mb-3">
        <Info className="text-slate-600 flex-shrink-0 mt-0.5" size={18} />

        <div>
          <h3 className="font-semibold text-slate-900 text-sm mb-1">
            Required Columns
          </h3>

          <p className="text-xs text-slate-600">
            Your file must include these column headers.
          </p>
        </div>
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

      {/* Special help for journals */}
      {importType === "journals" && (
        <div className="mt-3 text-blue-700 text-xs font-medium bg-blue-50 border border-blue-200 p-3 rounded-lg">
          💡 Each <code>journal_ref</code> groups multiple lines into one journal entry.
          Total of all <code>amount</code> values must equal <strong>0</strong>.
        </div>
      )}

    </div>
  );
}
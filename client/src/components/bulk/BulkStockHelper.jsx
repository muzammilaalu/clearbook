import { Database, Loader } from "lucide-react";

export default function BulkStockHelper({
  showHelper,
  accountCodes = [],
  vatRates = [],
  helperLoading,
  onFetch
}) {

  if (!showHelper && !helperLoading) {
    return (
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900 mb-3">
          Need help with Account Codes and VAT Rates for Stock Items?
        </p>

        <button
          onClick={onFetch}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Database size={16} />
          Load Valid Codes
        </button>
      </div>
    );
  }

  if (helperLoading) {
    return (
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-center gap-2">
        <Loader size={18} className="animate-spin text-blue-600" />
        <span className="text-sm text-blue-900">
          Loading codes...
        </span>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">

        <h4 className="font-semibold text-green-900 text-sm mb-2">
          Valid Account Codes
        </h4>

        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">

          {accountCodes.slice(0,20).map((code) => (
            <span
              key={code.id}
              className="px-2 py-1 bg-white border border-green-300 rounded text-xs font-mono text-green-800"
            >
              {code.id}
            </span>
          ))}

          {accountCodes.length > 20 && (
            <span className="px-2 py-1 text-xs text-green-700">
              +{accountCodes.length - 20} more
            </span>
          )}

        </div>

      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">

        <h4 className="font-semibold text-amber-900 text-sm mb-2">
          Valid VAT Rates
        </h4>

        <div className="flex flex-wrap gap-2">

          {vatRates.map((vat) => (
            <span
              key={vat.key}
              className="px-2 py-1 bg-white border border-amber-300 rounded text-xs font-mono text-amber-800"
            >
              {vat.key} ({vat.rate}%)
            </span>
          ))}

        </div>

      </div>

    </div>
  );
}
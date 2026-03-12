import { Info, RefreshCw } from 'lucide-react';

export default function BulkStockHelper({ showHelper, accountCodes, vatRates, helperLoading, onFetch }) {
  return (
    /* Stock Items Helper — Valid Account Codes & VAT Rates */
    <div className="mt-3">
      <button
        onClick={onFetch}
        disabled={helperLoading}
        className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        {helperLoading
          ? <><RefreshCw size={14} className="animate-spin" /> Loading...</>
          : <><Info size={14} /> View Valid Account Codes & VAT Rates</>
        }
      </button>

      {showHelper && (
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          {/* Account Codes */}
          <div className="border border-orange-200 rounded-lg overflow-hidden">
            <div className="bg-orange-50 px-3 py-2 font-semibold text-orange-800">
              📋 Account Codes ({accountCodes.length})
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-left text-gray-600">ID</th>
                    <th className="px-2 py-1 text-left text-gray-600">Name</th>
                    <th className="px-2 py-1 text-left text-gray-600">Sales/Purch</th>
                  </tr>
                </thead>
                <tbody>
                  {accountCodes.map((c, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1 font-mono font-bold text-orange-700">{c.id}</td>
                      <td className="px-2 py-1">{c.name}</td>
                      <td className="px-2 py-1 text-gray-500">
                        {c.sales ? '💰S' : ''}{c.purchases ? ' 🛒P' : ''}
                      </td>
                    </tr>
                  ))}
                  {accountCodes.length === 0 && (
                    <tr><td colSpan={3} className="px-2 py-3 text-center text-gray-400">No account codes found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* VAT Rates */}
          <div className="border border-orange-200 rounded-lg overflow-hidden">
            <div className="bg-orange-50 px-3 py-2 font-semibold text-orange-800">
              🧾 VAT Rates (use these in CSV)
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-left text-gray-600">Key (use in CSV)</th>
                    <th className="px-2 py-1 text-left text-gray-600">Label</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(vatRates) && vatRates.map((v, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1 font-mono font-bold text-orange-700">{v.key || v.vatRateKey || JSON.stringify(v)}</td>
                      <td className="px-2 py-1">{v.label || v.name || ''}</td>
                    </tr>
                  ))}
                  {(!vatRates || vatRates.length === 0) && (
                    <tr><td colSpan={2} className="px-2 py-3 text-center text-gray-400">No VAT rates found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
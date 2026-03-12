export default function BulkColumnInfo({ importType, config }) {
  return (
    /* Column info */
    <div className={`mt-3 p-3 rounded-lg text-sm ${config.infoBg}`}>
      <span className="font-semibold">Expected columns:</span>{' '}
      {importType === 'stockItems' ? (
        <>
          <code>name</code> (required) ·
          <code> type</code> (purchases/sales/both, required) ·
          <code> sku</code> ·
          <code> description</code> ·
          <code> sale_price</code> ·
          <code> sale_vat_rate</code> ·
          <code> sale_qty</code> ·
          <code> sales_account</code> ·
          <code> cost_price</code> ·
          <code> purchases_vat_rate</code> ·
          <code> purchases_qty</code> ·
          <code> purchases_account</code> ·
          <code> is_stock_item</code>
        </>
      ) : importType === 'journals' ? (
        <>
          <code>journal_ref</code> (group lines by this) ·
          <code> accounting_date</code> (required, YYYY-MM-DD) ·
          <code> description</code> ·
          <code> account_code</code> (required, integer ID) ·
          <code> amount</code> (required — debits +ve, credits -ve, sum must = 0 per journal) ·
          <code> line_description</code>
          <div className="mt-1 text-blue-700 font-medium">
            💡 Each journal_ref groups multiple lines into one journal entry. Lines sum must = 0.
          </div>
        </>
      ) : (
        <>
          <code>company_name</code> (required) ·
          <code> contact_name</code> ·
          <code> email</code> ·
          <code> phone1</code> ·
          <code> vat_number</code> ·
          <code> building</code> ·
          <code> address1</code> ·
          <code> town</code> ·
          <code> county</code> ·
          <code> postcode</code> ·
          <code> country</code>
        </>
      )}
    </div>
  );
}
import * as XLSX from 'xlsx';

// ── Export error rows to Excel ────────────────────────────────────────────
export function exportErrorsToExcel(errorRows, type) {
  const wsData = errorRows.map(({ row, errors }) => {
    const obj = type === 'stockItems' ? {
      name:              row.name || '',
      sku:               row.sku || '',
      type:              row.type || '',
      description:       row.description || '',
      sale_price:        row.sale_price || '',
      sales_account:     row.sales_account || '',
      sale_vat_rate:     row.sale_vat_rate || '',
      sale_qty:          row.sale_qty || '',
      cost_price:        row.cost_price || '',
      purchases_account: row.purchases_account || '',
      purchases_vat_rate:row.purchases_vat_rate || '',
      purchases_qty:     row.purchases_qty || '',
      is_stock_item:     row.is_stock_item || '',
    } : type === 'journals' ? {
      journal_ref:      row.journal_ref      || '',
      accounting_date:  row.accounting_date  || '',
      description:      row.description      || '',
      account_code:     row.account_code     || '',
      amount:           row.amount           || '',
      line_description: row.line_description || '',
    } : {
      company_name:   row.name || '',
      contact_name:   row.contactName || '',
      email:          row.email || '',
      phone1:         row.phone || '',
      vat_number:     row.vatNumber || '',
      company_number: row.companyNumber || '',
      building:       row.address_building || '',
      address1:       row.address_line1 || '',
      address2:       row.address_line2 || '',
      town:           row.address_town || '',
      county:         row.address_county || '',
      postcode:       row.address_postcode || '',
      country:        row.address_countryCode || '',
    };
    errors.forEach((err, i) => { obj[`ERROR_${i + 1}`] = err; });
    obj['ALL_ERRORS']   = errors.join(' | ');
    obj['TOTAL_ERRORS'] = errors.length;
    return obj;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(wsData);
  ws['!cols'] = Array(20).fill({ wch: 20 });
  XLSX.utils.book_append_sheet(wb, ws, 'Failed Rows');
  XLSX.writeFile(wb, `${type}_import_errors_${new Date().toISOString().slice(0,10)}.xlsx`);
}
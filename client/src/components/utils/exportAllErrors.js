import * as XLSX from 'xlsx';

// ── Add multiple error columns to a row object ────────────────────────────────
function addErrorCols(obj, errorsArray) {
  const arr = Array.isArray(errorsArray) ? errorsArray : [errorsArray].filter(Boolean);
  obj['total_errors'] = arr.length;          // total_errors FIRST
  arr.forEach((e, i) => { obj[`error_${i + 1}`] = e; });
  return obj;
}

export function exportAllErrors(apiFailed, frontendInvalid, importType) {
  const date = new Date().toISOString().slice(0, 10);
  const rows = [];

  // ── 1. ClearBooks API failed rows ─────────────────────────────────────────
  if (Array.isArray(apiFailed)) {
    apiFailed.forEach(({ row, journal, reason }) => {
      const r = row || journal || {};
      // reason may contain multiple errors joined by ' | ' — split them
      const errs = (reason || '').split(' | ').map(e => e.trim()).filter(Boolean);

      let base = {};
      if (importType === 'journals') {
        base = { ...base,
          journal_ref:     r.journal_ref    || '',
          accounting_date: r.accountingDate || '',
          description:     r.description    || '',
          lines_count:     r.lines?.length  || 0,
        };
      } else if (importType === 'stockItems') {
        base = { ...base,
          name:       r.name       || '',
          sku:        r.sku        || '',
          type:       r.type       || '',
          sale_price: r.salesUnitPrice    || '',
          cost_price: r.purchaseUnitPrice || '',
        };
      } else {
        base = { ...base,
          company_name: r.name             || '',
          email:        r.email            || '',
          phone:        r.phone            || '',
          vat_number:   r.vatNumber        || '',
          town:         r.address_town     || '',
          postcode:     r.address_postcode || '',
        };
      }
      rows.push(addErrorCols(base, errs));
    });
  }

  // ── 2. Frontend validation invalid rows ───────────────────────────────────
  if (Array.isArray(frontendInvalid)) {
    frontendInvalid.forEach(({ row, errors }) => {
      let base = {};
      if (importType === 'journals') {
        base = { ...base,
          journal_ref:     row?.journal_ref     || '',
          accounting_date: row?.accounting_date || '',
          description:     row?.description     || '',
          lines_count:     '',
        };
      } else if (importType === 'stockItems') {
        base = { ...base,
          name:       row?.name       || '',
          sku:        row?.sku        || '',
          type:       row?.type       || '',
          sale_price: row?.sale_price || '',
          cost_price: row?.cost_price || '',
        };
      } else {
        base = { ...base,
          company_name: row?.name             || '',
          email:        row?.email            || '',
          phone:        row?.phone            || '',
          vat_number:   row?.vatNumber        || '',
          town:         row?.address_town     || '',
          postcode:     row?.address_postcode || '',
        };
      }
      rows.push(addErrorCols(base, errors || []));
    });
  }

  if (!rows.length) return;

  // Collect all unique keys — total_errors first, then data cols, then error_1, error_2...
  const allKeys = [];
  rows.forEach(r => Object.keys(r).forEach(k => { if (!allKeys.includes(k)) allKeys.push(k); }));
  // Re-order: total_errors first, error_N last
  const errorCols   = allKeys.filter(k => k.startsWith('error_'));
  const totalCol    = allKeys.filter(k => k === 'total_errors');
  const dataCols    = allKeys.filter(k => k !== 'total_errors' && !k.startsWith('error_') && k !== 'source');
  const orderedKeys = [...totalCol, ...dataCols, ...errorCols];

  // Rebuild rows with all keys present
  const normalised = rows.map(r => {
    const obj = {};
    orderedKeys.forEach(k => { obj[k] = r[k] ?? ''; });
    return obj;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(normalised, { header: orderedKeys });
  ws['!cols'] = orderedKeys.map(k => {
    if (k === 'source')         return { wch: 16 };
    if (k.startsWith('error_')) return { wch: 80 };
    if (k === 'total_errors')   return { wch: 14 };
    return { wch: 22 };
  });
  XLSX.utils.book_append_sheet(wb, ws, 'All Errors');
  XLSX.writeFile(wb, `${importType}_errors_${date}.xlsx`);
}
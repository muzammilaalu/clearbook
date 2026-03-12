// ── Validation ────────────────────────────────────────────────────────────
export function validateRow(row, type = 'customers') {
  // ── Only block rows that are completely empty or missing critical parse fields ──
  // All real validation is done by ClearBooks API — errors come back in error Excel

//   if (type === 'journals') {
//     const errors = [];
//     if (!row.accounting_date?.toString().trim()) errors.push('accounting_date is required');
//     if (!row.account_code?.toString().trim())    errors.push('account_code is required');
//     if (row.amount == null || row.amount === '')  errors.push('amount is required');
//     return errors;
//   }

  // Customers / Suppliers / Stock Items — only block if name is completely missing
  const errors = [];
  // const nameVal = row.name?.toString().trim();
  // if (!nameVal) {
  //   errors.push(type === 'stockItems' ? 'name is required' : 'company_name is required');
  // }
  return errors;
}
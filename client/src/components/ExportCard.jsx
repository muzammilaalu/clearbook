import { useState } from "react";
import { Download, FileSpreadsheet, ChevronDown, Info, TrendingUp } from "lucide-react";
import * as XLSX from "xlsx";
import { customerService, supplierService, stockItemService, accountCodeService, bankAccountService, salesService } from "../services/api";

export default function ExportCard({ businessId, showNotification, onExport, onExportDone }) {
  const [selected, setSelected] = useState("customers");
  const [downloading, setDownloading] = useState(false);
  const [open, setOpen] = useState(false);

  const options = [
    { value: "customers",        label: "Customers",         color: "green",  desc: "Export all customer records with contact details" },
    { value: "suppliers",        label: "Suppliers",         color: "blue",   desc: "Export supplier information and addresses" },
    { value: "stockItems",       label: "Stock Items",       color: "orange", desc: "Export inventory with pricing and quantities" },
    { value: "accountCodes",     label: "Account Codes",     color: "teal",   desc: "Export chart of accounts structure" },
    { value: "bankAccounts",     label: "Bank Accounts",     color: "slate",  desc: "Export bank account details and settings" },
    { value: "salesAttachments", label: "Sales Attachments", color: "rose",   desc: "Export sales invoice attachments list" },
  ];

  const current = options.find((o) => o.value === selected);

  const btnClass =
    current?.color === "green"  ? "bg-green-600 hover:bg-green-700"   :
    current?.color === "blue"   ? "bg-blue-600 hover:bg-blue-700"     :
    current?.color === "orange" ? "bg-orange-600 hover:bg-orange-700" :
    current?.color === "teal"   ? "bg-teal-600 hover:bg-teal-700"     :
    current?.color === "rose"   ? "bg-rose-600 hover:bg-rose-700"     :
                                  "bg-slate-600 hover:bg-slate-700";

  const dotClass =
    current?.color === "green"  ? "bg-green-500"  :
    current?.color === "blue"   ? "bg-blue-500"   :
    current?.color === "orange" ? "bg-orange-500" :
    current?.color === "teal"   ? "bg-teal-500"   :
    current?.color === "rose"   ? "bg-rose-500"   :
                                  "bg-slate-500";

  const iconClass =
    current?.color === "green"  ? "text-green-600"  :
    current?.color === "blue"   ? "text-blue-600"   :
    current?.color === "orange" ? "text-orange-600" :
    current?.color === "teal"   ? "text-teal-600"   :
    current?.color === "rose"   ? "text-rose-600"   :
                                  "text-slate-600";

  const buildCustomerRows = (data) => data.map((c) => ({
    id: c.id || '',
    company_name: c.name || '',
    contact_name: [c.contactName?.title, c.contactName?.forenames, c.contactName?.surname].filter(Boolean).join(' ') || '',
    building: c.address?.building || '',
    address1: c.address?.line1 || '',
    address2: c.address?.line2 || '',
    town: c.address?.town || '',
    county: c.address?.county || '',
    postcode: c.address?.postcode || '',
    email: c.email || '',
    phone1: c.phone || '',
    phone2: '', fax: '', website: c.website || '',
    vat_number: c.vatNumber || '',
    company_number: c.companyNumber || '',
    project_name: '',
    archived_status: c.archived ? 'archived' : 'not',
    date_created: c.createdAt || '',
    last_transaction_date: '',
    deliv_building: c.deliveryAddress?.building || '',
    deliv_address1: c.deliveryAddress?.line1 || '',
    deliv_address2: c.deliveryAddress?.line2 || '',
    deliv_town: c.deliveryAddress?.town || '',
    deliv_county: c.deliveryAddress?.county || '',
    deliv_postcode: c.deliveryAddress?.postcode || '',
    bank_acc_num: '', bank_sortcode: '',
    country: c.address?.countryCode || '',
    deliv_country: c.deliveryAddress?.countryCode || '',
  }));

  const buildSupplierRows = (data) => data.map((s) => ({
    id: s.id || '',
    company_name: s.name || '',
    contact_name: [s.contactName?.title, s.contactName?.forenames, s.contactName?.surname].filter(Boolean).join(' ') || '',
    building: s.address?.building || '',
    address1: s.address?.line1 || '',
    address2: s.address?.line2 || '',
    town: s.address?.town || '',
    county: s.address?.county || '',
    postcode: s.address?.postcode || '',
    email: s.email || '',
    phone1: s.phone || '',
    phone2: '', fax: '', website: s.website || '',
    vat_number: s.vatNumber || '',
    company_number: s.companyNumber || '',
    project_name: '',
    archived_status: s.archived ? 'archived' : 'not',
    date_created: s.createdAt || '',
    last_transaction_date: '',
    deliv_building: s.deliveryAddress?.building || '',
    deliv_address1: s.deliveryAddress?.line1 || '',
    deliv_address2: s.deliveryAddress?.line2 || '',
    deliv_town: s.deliveryAddress?.town || '',
    deliv_county: s.deliveryAddress?.county || '',
    deliv_postcode: s.deliveryAddress?.postcode || '',
    bank_acc_num: '', bank_sortcode: '',
    country: s.address?.countryCode || '',
    deliv_country: s.deliveryAddress?.countryCode || '',
  }));

  const buildStockItemRows = (data) => data.map((s) => ({
    id: s.id || '',
    name: s.name || '',
    sku: s.sku || '',
    display_sku: s.displaySku || '',
    type: s.type || '',
    description: s.description || '',
    sale_price: s.salesUnitPrice ?? '',
    sale_vat_rate: s.salesVatRateKey || '',
    sale_qty: s.salesQuantity ?? '',
    sales_account: s.salesAccountCode || '',
    sales_account_name: '',
    cost_price: s.purchaseUnitPrice ?? '',
    purchases_vat_rate: s.purchaseVatRateKey || '',
    purchases_qty: s.purchaseQuantity ?? '',
    purchases_account: s.purchaseAccountCode || '',
    purchases_account_name: '',
    is_stock_item: s.trackStock ? 'true' : 'false',
    stock_balance: s.stockLevel ?? '',
  }));

  const buildAccountCodeRows = (data) => data.map((c) => ({
    id: c.id || '',
    name: c.name || '',
    heading: c.heading ?? '',
    default_vat_rate: c.defaultVatRate || '',
    sales: c.sales ? 'Yes' : 'No',
    purchases: c.purchases ? 'Yes' : 'No',
  }));

  const buildBankAccountRows = (data) => data.map((b) => ({
    id: b.id || '',
    account_code: b.accountCode || '',
    name: b.name || '',
    account_number: b.accountNumber || '',
    sort_code: b.sortCode || '',
    iban: b.iban || '',
    swift: b.swift || '',
    currency: b.currency || '',
    payment_methods: Array.isArray(b.paymentMethods)
      ? b.paymentMethods.map(p => p.name).join(', ')
      : '',
  }));

  const buildSalesAttachmentRows = (data) => data.map((a) => ({
    invoice_id:       a.invoice_id || '',
    invoice_ref:      a.invoice_ref || '',
    invoice_date:     a.invoice_date || '',
    invoice_due_date: a.invoice_due_date || '',
    invoice_total:    a.invoice_total ?? '',
    invoice_status:   a.invoice_status || '',
    attachment_id:    a.att_id || '',
    attachment_name:  a.att_name || '',
    attachment_size:  a.att_size ?? '',
    date_uploaded:    a.att_uploaded || '',
  }));

  const colWidths = [
    { wch: 8 }, { wch: 22 }, { wch: 20 }, { wch: 12 }, { wch: 22 }, { wch: 22 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 28 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 22 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 22 }, { wch: 22 }, { wch: 14 },
    { wch: 14 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 12 },
  ];

  const handleDownload = async () => {
    if (!businessId) { showNotification("error", "No business selected."); return; }
    setDownloading(true);
    try {
      let data;
      if      (selected === "customers")        data = await customerService.exportCustomers(businessId);
      else if (selected === "suppliers")        data = await supplierService.exportSuppliers(businessId);
      else if (selected === "stockItems")       data = await stockItemService.exportStockItems(businessId);
      else if (selected === "accountCodes")     data = await accountCodeService.fetchAccountCodes(businessId);
      else if (selected === "bankAccounts")     data = await bankAccountService.fetchBankAccounts(businessId);
      else if (selected === "salesAttachments") data = await salesService.fetchSalesAttachments(businessId);

      if (!data || data.length === 0) {
        showNotification("error", `No ${current.label} found to export.`);
        return;
      }

      const rows =
        selected === "customers"        ? buildCustomerRows(data)          :
        selected === "suppliers"        ? buildSupplierRows(data)          :
        selected === "stockItems"       ? buildStockItemRows(data)         :
        selected === "accountCodes"     ? buildAccountCodeRows(data)       :
        selected === "bankAccounts"     ? buildBankAccountRows(data)       :
                                          buildSalesAttachmentRows(data);

      const sheetName =
        selected === "customers"        ? "Customers"        :
        selected === "suppliers"        ? "Suppliers"        :
        selected === "stockItems"       ? "Stock Items"      :
        selected === "accountCodes"     ? "Account Codes"    :
        selected === "bankAccounts"     ? "Bank Accounts"    :
                                          "Sales Attachments";

      const fileName    = `${selected}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const headerColor =
        selected === "customers"        ? "22C55E" :
        selected === "suppliers"        ? "3B82F6" :
        selected === "stockItems"       ? "F97316" :
        selected === "accountCodes"     ? "14B8A6" :
        selected === "bankAccounts"     ? "64748B" :
                                          "F43F5E";

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = colWidths;

      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: headerColor } },
        alignment: { horizontal: "center" },
      };
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: 0, c: C });
        if (ws[addr]) ws[addr].s = headerStyle;
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);

      // ── Notify parent — pass ISO timestamp for dashboard stats ──────────
      const isoNow = new Date().toISOString();
      if (onExport)     onExport(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (onExportDone) onExportDone(isoNow);

      showNotification("success", `✅ ${data.length} ${current.label} exported to Excel!`);
    } catch (err) {
      console.error(err);
      showNotification("error", `Failed to export ${current.label}.`);
    } finally {
      setDownloading(false);
    }
  };

  const getDotClass = (color) =>
    color === "green"  ? "bg-green-500"  :
    color === "blue"   ? "bg-blue-500"   :
    color === "orange" ? "bg-orange-500" :
    color === "teal"   ? "bg-teal-500"   :
    color === "rose"   ? "bg-rose-500"   :
                         "bg-slate-500";

  return (
    <div className="grid lg:grid-cols-3 gap-6">

      {/* Main Export Card */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8 border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <div className={`${iconClass.replace('text-', 'bg-').replace('600', '50')} p-4 rounded-xl`}>
            <FileSpreadsheet size={32} className={iconClass} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Export to Excel</h2>
            <p className="text-sm text-gray-600 mt-1">Download your data in Excel format for analysis and reporting</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">About Excel Export</p>
              <p className="text-blue-700">Your data will be exported with properly formatted columns, styled headers, and optimized column widths for easy viewing in Excel or Google Sheets.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Data Type</label>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-5 py-4 border-2 border-gray-200 hover:border-gray-300 rounded-xl bg-white font-medium text-gray-700 transition-all shadow-sm"
            >
              <span className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${dotClass}`} />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{current.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{current.desc}</p>
                </div>
              </span>
              <ChevronDown size={20} className={`transition-transform text-gray-400 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSelected(opt.value); setOpen(false); }}
                    className={`w-full flex items-start gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors text-left border-b border-gray-100 last:border-b-0 ${selected === opt.value ? "bg-gray-50 font-semibold" : ""}`}
                  >
                    <span className={`w-3 h-3 rounded-full ${getDotClass(opt.color)} mt-1.5 flex-shrink-0`} />
                    <div>
                      <p className="font-medium text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading || !businessId}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 ${btnClass} disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-base mt-6`}
          >
            <Download size={22} className={downloading ? "animate-bounce" : ""} />
            {downloading ? "Downloading..." : `Download ${current.label}`}
          </button>

          {!businessId && (
            <p className="text-sm text-center text-amber-600 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200">
              Waiting for business connection...
            </p>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-6">

        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-emerald-700" size={20} />
            <h3 className="font-semibold text-emerald-900">Export Preview</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-emerald-200">
              <span className="text-emerald-700">Format:</span>
              <span className="font-semibold text-emerald-900">.xlsx</span>
            </div>
            <div className="flex justify-between py-2 border-b border-emerald-200">
              <span className="text-emerald-700">Compression:</span>
              <span className="font-semibold text-emerald-900">Optimized</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-emerald-700">Compatibility:</span>
              <span className="font-semibold text-emerald-900">Excel 2007+</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
          <h3 className="font-semibold text-gray-900 mb-4">What's Included</h3>
          <ul className="space-y-2.5 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>All records from selected data type</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>Formatted column headers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>Auto-sized columns for readability</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>Color-coded header styling</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-md">
          <h3 className="font-semibold text-gray-900 mb-3">Export Tips</h3>
          <ul className="space-y-2 text-xs text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Files are named with current date for easy organization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Use exports for backup, analysis, or migration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Compatible with Excel, Google Sheets, and Numbers</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
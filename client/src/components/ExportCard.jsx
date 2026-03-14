import { useState } from "react";
import { Download, FileSpreadsheet, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import { customerService, supplierService, stockItemService, accountCodeService, bankAccountService, salesService } from "../services/api";

export default function ExportCard({ businessId, showNotification }) {
  const [selected,    setSelected]    = useState("customers");
  const [downloading, setDownloading] = useState(false);
  const [open,        setOpen]        = useState(false);

  const options = [
    { value: "customers",         label: "Customers",           color: "green"  },
    { value: "suppliers",         label: "Suppliers",           color: "purple" },
    { value: "stockItems",        label: "Stock Items",         color: "orange" },
    { value: "accountCodes",      label: "Account Codes",       color: "teal"   },
    { value: "bankAccounts",      label: "Bank Accounts",       color: "indigo" },
    { value: "salesAttachments",  label: "Sales Attachments",   color: "rose"   },
  ];

  const current = options.find((o) => o.value === selected);

  const btnClass =
    current?.color === "green"  ? "bg-green-600 hover:bg-green-700"   :
    current?.color === "purple" ? "bg-purple-600 hover:bg-purple-700" :
    current?.color === "orange" ? "bg-orange-600 hover:bg-orange-700" :
    current?.color === "teal"   ? "bg-teal-600 hover:bg-teal-700"     :
    current?.color === "rose"   ? "bg-rose-600 hover:bg-rose-700"     :
                                  "bg-indigo-600 hover:bg-indigo-700";

  const dotClass =
    current?.color === "green"  ? "bg-green-500"  :
    current?.color === "purple" ? "bg-purple-500" :
    current?.color === "orange" ? "bg-orange-500" :
    current?.color === "teal"   ? "bg-teal-500"   :
    current?.color === "rose"   ? "bg-rose-500"   :
                                  "bg-indigo-500";

  const iconClass =
    current?.color === "green"  ? "text-green-600"  :
    current?.color === "purple" ? "text-purple-600" :
    current?.color === "orange" ? "text-orange-600" :
    current?.color === "teal"   ? "text-teal-600"   :
    current?.color === "rose"   ? "text-rose-600"   :
                                  "text-indigo-600";

  // ── Row builders ──────────────────────────────────────────────────────────
  const buildCustomerRows = (data) => data.map((c) => ({
    id:                   c.id || '',
    company_name:         c.name || '',
    contact_name:         [c.contactName?.title, c.contactName?.forenames, c.contactName?.surname].filter(Boolean).join(' ') || '',
    building:             c.address?.building || '',
    address1:             c.address?.line1 || '',
    address2:             c.address?.line2 || '',
    town:                 c.address?.town || '',
    county:               c.address?.county || '',
    postcode:             c.address?.postcode || '',
    email:                c.email || '',
    phone1:               c.phone || '',
    phone2: '', fax: '', website: c.website || '',
    vat_number:           c.vatNumber || '',
    company_number:       c.companyNumber || '',
    project_name:         '',
    archived_status:      c.archived ? 'archived' : 'not',
    date_created:         c.createdAt || '',
    last_transaction_date:'',
    deliv_building:       c.deliveryAddress?.building || '',
    deliv_address1:       c.deliveryAddress?.line1 || '',
    deliv_address2:       c.deliveryAddress?.line2 || '',
    deliv_town:           c.deliveryAddress?.town || '',
    deliv_county:         c.deliveryAddress?.county || '',
    deliv_postcode:       c.deliveryAddress?.postcode || '',
    bank_acc_num: '', bank_sortcode: '',
    country:              c.address?.countryCode || '',
    deliv_country:        c.deliveryAddress?.countryCode || '',
  }));

  const buildSupplierRows = (data) => data.map((s) => ({
    id:                   s.id || '',
    company_name:         s.name || '',
    contact_name:         [s.contactName?.title, s.contactName?.forenames, s.contactName?.surname].filter(Boolean).join(' ') || '',
    building:             s.address?.building || '',
    address1:             s.address?.line1 || '',
    address2:             s.address?.line2 || '',
    town:                 s.address?.town || '',
    county:               s.address?.county || '',
    postcode:             s.address?.postcode || '',
    email:                s.email || '',
    phone1:               s.phone || '',
    phone2: '', fax: '', website: s.website || '',
    vat_number:           s.vatNumber || '',
    company_number:       s.companyNumber || '',
    project_name:         '',
    archived_status:      s.archived ? 'archived' : 'not',
    date_created:         s.createdAt || '',
    last_transaction_date:'',
    deliv_building:       s.deliveryAddress?.building || '',
    deliv_address1:       s.deliveryAddress?.line1 || '',
    deliv_address2:       s.deliveryAddress?.line2 || '',
    deliv_town:           s.deliveryAddress?.town || '',
    deliv_county:         s.deliveryAddress?.county || '',
    deliv_postcode:       s.deliveryAddress?.postcode || '',
    bank_acc_num: '', bank_sortcode: '',
    country:              s.address?.countryCode || '',
    deliv_country:        s.deliveryAddress?.countryCode || '',
  }));

  const buildStockItemRows = (data) => data.map((s) => ({
    id:                    s.id || '',
    name:                  s.name || '',
    sku:                   s.sku || '',
    display_sku:           s.displaySku || '',
    type:                  s.type || '',
    description:           s.description || '',
    sale_price:            s.salesUnitPrice ?? '',
    sale_vat_rate:         s.salesVatRateKey || '',
    sale_qty:              s.salesQuantity ?? '',
    sales_account:         s.salesAccountCode || '',
    sales_account_name:    '',
    cost_price:            s.purchaseUnitPrice ?? '',
    purchases_vat_rate:    s.purchaseVatRateKey || '',
    purchases_qty:         s.purchaseQuantity ?? '',
    purchases_account:     s.purchaseAccountCode || '',
    purchases_account_name:'',
    is_stock_item:         s.trackStock ? 'true' : 'false',
    stock_balance:         s.stockLevel ?? '',
  }));

  const buildAccountCodeRows = (data) => data.map((c) => ({
    id:               c.id || '',
    name:             c.name || '',
    heading:          c.heading ?? '',
    default_vat_rate: c.defaultVatRate || '',
    sales:            c.sales     ? 'Yes' : 'No',
    purchases:        c.purchases ? 'Yes' : 'No',
  }));

  const buildBankAccountRows = (data) => data.map((b) => ({
    id:             b.id || '',
    account_code:   b.accountCode || '',
    name:           b.name || '',
    account_number: b.accountNumber || '',
    sort_code:      b.sortCode || '',
    iban:           b.iban || '',
    swift:          b.swift || '',
    currency:       b.currency || '',
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
    { wch: 14 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 8  }, { wch: 12 },
  ];

  // ── Download handler ──────────────────────────────────────────────────────
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
        selected === "customers"        ? "Customers"          :
        selected === "suppliers"        ? "Suppliers"          :
        selected === "stockItems"       ? "Stock Items"        :
        selected === "accountCodes"     ? "Account Codes"      :
        selected === "bankAccounts"     ? "Bank Accounts"      :
                                          "Sales Attachments";

      const fileName = `${selected}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const headerColor =
        selected === "customers"        ? "1F4E79" :
        selected === "suppliers"        ? "6B21A8" :
        selected === "stockItems"       ? "C2410C" :
        selected === "accountCodes"     ? "0F766E" :
        selected === "bankAccounts"     ? "3730A3" :
                                          "9F1239";

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = colWidths;

      const headerStyle = {
        font:      { bold: true, color: { rgb: "FFFFFF" } },
        fill:      { fgColor: { rgb: headerColor } },
        alignment: { horizontal: "center" },
      };
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: 0, c: C });
        if (ws[addr]) ws[addr].s = headerStyle;
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);
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
    color === "purple" ? "bg-purple-500" :
    color === "orange" ? "bg-orange-500" :
    color === "teal"   ? "bg-teal-500"   :
    color === "rose"   ? "bg-rose-500"   :
                         "bg-indigo-500";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center gap-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <FileSpreadsheet size={44} className={iconClass} />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Export to Excel</h2>
          <p className="text-sm text-gray-500">Select type and download</p>
        </div>
      </div>

      {/* Dropdown */}
      <div className="relative w-64">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 hover:border-gray-300 hover:cursor-pointer rounded-lg bg-white font-medium text-gray-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${dotClass}`} />
            {current.label}
          </span>
          <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSelected(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors text-left ${selected === opt.value ? "bg-gray-50 font-semibold" : ""}`}
              >
                <span className={`w-3 h-3 rounded-full ${getDotClass(opt.color)}`} />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={downloading || !businessId}
        className={`flex items-center gap-2 px-8 py-3 ${btnClass} disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors text-base w-64 justify-center`}
      >
        <Download size={20} className={downloading ? "animate-bounce" : ""} />
        {downloading ? "Downloading..." : `Download ${current.label} Excel`}
      </button>

      {!businessId && (
        <p className="text-xs text-orange-500">Wait for the business to load...</p>
      )}
    </div>
  );
}
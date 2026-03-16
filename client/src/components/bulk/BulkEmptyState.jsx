// BulkEmptyState — dikhta hai jab tak file upload nahi hoti
import { FileSpreadsheet, ArrowRight, CheckCircle2, AlertCircle, Eye, Upload } from "lucide-react";

const STEPS = [
  {
    icon: FileSpreadsheet,
    color: "bg-blue-50 text-blue-600",
    title: "Download Template",
    desc:  "Click 'Download Template' to get the correct Excel format with required columns.",
  },
  {
    icon: Upload,
    color: "bg-violet-50 text-violet-600",
    title: "Upload Your File",
    desc:  "Click the upload area above and select your CSV or Excel file.",
  },
  {
    icon: Eye,
    color: "bg-emerald-50 text-emerald-600",
    title: "Preview & Validate",
    desc:  "Valid rows will appear here. Invalid rows are highlighted with errors.",
  },
  {
    icon: CheckCircle2,
    color: "bg-rose-50 text-rose-600",
    title: "Import to ClearBooks",
    desc:  "Click Import to push all valid rows directly into your ClearBooks account.",
  },
];

const TIPS = {
  customers:  ["company_name is the only required field", "Email & phone are optional but recommended", "Country should be a 2-letter code e.g. GB, US"],
  suppliers:  ["company_name is the only required field", "VAT number format: GB + 9 digits", "Use GB for United Kingdom addresses"],
  stockItems: ["name and type are required fields", "type must be: sales, purchases, or both", "Use account code IDs from Account Codes export"],
  journals:   ["All lines with same journal_ref form one entry", "Debits are positive (+), credits are negative (−)", "All amounts per journal_ref must sum to zero"],
};

export default function BulkEmptyState({ importType }) {
  const tips = TIPS[importType] || TIPS.customers;

  return (
    <div className="mt-6 animate-fadeIn">

      {/* How it works */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">How it works</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((step, i) => (
            <div key={i} className="relative flex flex-col gap-2 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
              {/* Step number */}
              <span className="absolute top-3 right-3 text-xs font-bold text-gray-300">0{i + 1}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${step.color}`}>
                <step.icon size={18} />
              </div>
              <p className="text-sm font-semibold text-gray-800">{step.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <ArrowRight size={14} className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-gray-300 z-10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tips for current type */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={15} className="text-amber-600" />
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
            Tips for {importType === 'stockItems' ? 'Stock Items' : importType.charAt(0).toUpperCase() + importType.slice(1)}
          </p>
        </div>
        <ul className="space-y-1.5">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-amber-900">
              <span className="text-amber-500 font-bold mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
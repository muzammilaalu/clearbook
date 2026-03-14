import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function BulkHeader({ importType, config, onTypeChange }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const types = [
    { value: "customers", label: "Customers", color: "bg-green-50 text-green-700 border-green-200" },
    { value: "suppliers", label: "Suppliers", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { value: "stockItems", label: "Stock Items", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { value: "journals", label: "Journals", color: "bg-teal-50 text-teal-700 border-teal-200" }
  ];

  const currentType = types.find(t => t.value === importType) || types[0];

  return (
    <div className="mb-6">

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Bulk Import
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        Select the type of data you want to import
      </p>

      <div className="relative">

        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center justify-between w-full md:w-80 px-4 py-3 rounded-xl border-2 font-medium transition-all shadow-sm ${currentType.color}`}
        >
          <span>Import {currentType.label}</span>

          <ChevronDown
            size={18}
            className={`transition-transform ${showDropdown ? "rotate-180" : ""}`}
          />
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-2 w-full md:w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">

            {types.map(type => (
              <button
                key={type.value}
                onClick={() => {
                  onTypeChange(type.value);
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  importType === type.value ? "bg-gray-50 font-semibold" : ""
                }`}
              >
                {type.label}
              </button>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}
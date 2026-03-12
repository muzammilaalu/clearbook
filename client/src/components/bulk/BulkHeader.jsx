import { FileSpreadsheet, ChevronDown } from 'lucide-react';

export default function BulkHeader({ importType, config, onTypeChange }) {
  return (
    /* Header + Type Selector */
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FileSpreadsheet size={24} className={`text-${config.color}-600`} />
        Bulk Import
      </h2>
      <div className="relative">
        <select
          value={importType}
          onChange={(e) => onTypeChange(e.target.value)}
          className={`appearance-none pl-4 pr-10 py-2 border-2 border-${config.color}-300 rounded-lg font-medium text-${config.color}-700 bg-${config.color}-50 focus:outline-none focus:ring-2 focus:ring-${config.color}-400 cursor-pointer`}
        >
          <option value="customers">Customers</option>
          <option value="suppliers">Suppliers</option>
          <option value="stockItems">Stock Items</option>
          <option value="journals">Journals</option>
        </select>
        <ChevronDown size={16} className={`absolute right-3 top-3 text-${config.color}-500 pointer-events-none`} />
      </div>
    </div>
  );
}
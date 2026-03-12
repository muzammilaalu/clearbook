import { Upload } from 'lucide-react';

export default function BulkUploadBox({ fileName, config, fileInputRef, onFileChange }) {
  return (
    /* Upload Box */
    <div
      onClick={() => fileInputRef.current.click()}
      className={`border-2 border-dashed border-gray-300 ${config.borderHover} rounded-lg p-8 text-center cursor-pointer transition-colors`}
    >
      <Upload size={40} className="mx-auto mb-2 text-gray-400" />
      <p className="text-gray-600 font-medium">{fileName || 'Click to upload CSV or Excel file'}</p>
      <p className="text-gray-400 text-sm mt-1">.csv · .xlsx · .xls</p>
      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls"
        className="hidden" onChange={onFileChange} />
    </div>
  );
}
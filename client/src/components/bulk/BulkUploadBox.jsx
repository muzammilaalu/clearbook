import { Upload, FileSpreadsheet } from "lucide-react";

export default function BulkUploadBox({
  fileName,
  fileInputRef,
  onFileChange
}) {

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileChange({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="mb-6">

      <label className="block text-sm font-medium text-gray-700 mb-3">
        Upload File
      </label>

      <div
        onClick={() => fileInputRef?.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
      >

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFileChange}
          className="hidden"
        />

        {fileName ? (

          <div className="flex items-center justify-center gap-3">

            <FileSpreadsheet className="text-green-600" size={32} />

            <div className="text-left">
              <p className="font-semibold text-gray-900">
                {fileName}
              </p>

              <p className="text-xs text-gray-500">
                Click to change file
              </p>
            </div>

          </div>

        ) : (

          <div>

            <Upload
              className="mx-auto text-gray-400 group-hover:text-blue-500 transition-colors mb-3"
              size={40}
            />

            <p className="text-gray-700 font-medium mb-1">
              Click to upload or drag and drop
            </p>

            <p className="text-xs text-gray-500">
              CSV, XLSX, or XLS files supported
            </p>

          </div>

        )}

      </div>

    </div>
  );
}
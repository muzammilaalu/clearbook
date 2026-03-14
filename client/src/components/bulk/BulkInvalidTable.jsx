import { AlertCircle } from "lucide-react";

export default function BulkInvalidTable({ invalidRows = [], importType }) {
  if (!invalidRows.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-red-200 overflow-hidden">

      <div className="bg-red-50 px-6 py-4 border-b border-red-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <h3 className="font-semibold text-red-900">Invalid Rows</h3>
        </div>

        <p className="text-sm text-red-700 mt-1">
          These rows have validation errors and will not be imported
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead className="bg-red-100 border-b border-red-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-red-900">
                Row #
              </th>

              <th className="px-4 py-3 text-left font-semibold text-red-900">
                Errors
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {invalidRows.map((item, idx) => (

              <tr key={idx} className="hover:bg-red-50">

                <td className="px-4 py-3 text-gray-700">
                  {item?.row?.row_number || idx + 1}
                </td>

                <td className="px-4 py-3">
                  <ul className="space-y-1">

                    {item?.errors?.map((err, i) => (
                      <li key={i} className="text-red-700 text-xs">
                        • {err}
                      </li>
                    ))}

                  </ul>
                </td>

              </tr>

            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}
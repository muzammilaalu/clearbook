// import { Building2 } from "lucide-react";

// export default function BusinessList({ businesses, loading }) {
//   if (loading) {
//     return (
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//           <Building2 size={24} />
//           Businesses
//         </h2>
//         <p className="text-gray-500">Loading businesses...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//         <Building2 size={24} />
//         Businesses ({businesses.length})
//       </h2>

//       {businesses.length === 0 ? (
//         <p className="text-gray-500">No businesses found.</p>
//       ) : (
//         <div className="space-y-3">
//           {businesses.map((business) => (
//             <div
//               key={business.id}
//               className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
//             >
//               <h3 className="font-medium text-lg">{business.name}</h3>
//               <p className="text-sm text-gray-600 mt-1">
//                 ID: {business.id}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }



import { Building2, Calendar, Hash } from "lucide-react";

export default function BusinessList({
  businesses = [],
  loading = false,
  selectedId = null,
  onSelect = () => {}
}) {

  // Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200 text-center">
        <Building2 className="mx-auto text-gray-400 mb-3 animate-pulse" size={48} />
        <p className="text-gray-600">Loading businesses...</p>
      </div>
    );
  }

  // Empty State
  if (!businesses || businesses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200 text-center">
        <Building2 className="mx-auto text-gray-400 mb-3" size={48} />
        <p className="text-gray-600">No businesses found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">

      {/* Header */}
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
        <Building2 size={22} />
        Businesses ({businesses.length})
      </h2>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <button
            key={business.id}
            onClick={() => onSelect(business.id)}
            className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
              selectedId === business.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3">

              {/* Icon */}
              <div
                className={`p-2 rounded-lg ${
                  selectedId === business.id ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <Building2
                  size={20}
                  className={
                    selectedId === business.id
                      ? "text-blue-600"
                      : "text-gray-600"
                  }
                />
              </div>

              {/* Business Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold mb-1 truncate ${
                    selectedId === business.id
                      ? "text-blue-900"
                      : "text-gray-900"
                  }`}
                >
                  {business.name}
                </h3>

                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Hash size={12} />
                  <span>ID: {business.id}</span>
                </div>

                {business.createdAt && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>
                      {new Date(business.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </button>
        ))}
      </div>

    </div>
  );
}
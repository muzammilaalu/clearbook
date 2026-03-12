import { Building2 } from "lucide-react";

export default function BusinessList({ businesses, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 size={24} />
          Businesses
        </h2>
        <p className="text-gray-500">Loading businesses...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Building2 size={24} />
        Businesses ({businesses.length})
      </h2>

      {businesses.length === 0 ? (
        <p className="text-gray-500">No businesses found.</p>
      ) : (
        <div className="space-y-3">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <h3 className="font-medium text-lg">{business.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                ID: {business.id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




// 2VZFQZ35YZW5LRG54OXNJZJBMNKCQJQK
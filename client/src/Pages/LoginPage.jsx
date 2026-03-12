import { BookOpen } from "lucide-react";
import AuthButton from "../components/AuthButton";

export default function LoginPage({ onLogin, loading }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <BookOpen className="text-blue-600" size={32} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ClearBooks Integration
          </h1>

          <p className="text-gray-600 mb-8">
            Connect your ClearBooks account to manage customers, businesses,
            and more.
          </p>

          <div className="flex justify-center">
            <AuthButton
              isAuthenticated={false}
              onLogin={onLogin}
              onLogout={() => {}}
              loading={loading}
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Features:
          </h2>

          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              Fetch and view businesses
            </li>

            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              Manage customer data
            </li>

            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              Create new customers
            </li>

            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              Secure OAuth2 authentication
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
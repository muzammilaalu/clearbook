import { BookOpen, Database, Shield, Zap, FileSpreadsheet } from "lucide-react";
import AuthButton from "../components/AuthButton";

export default function LoginPage({ onLogin, loading }) {
  const features = [
    {
      icon: Database,
      title: "Business Management",
      description: "Fetch and view all your businesses in one centralized dashboard",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: FileSpreadsheet,
      title: "Bulk Operations",
      description: "Import and export customers, suppliers, and stock items at scale",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Seamlessly synchronize data with your ClearBooks account",
      color: "bg-amber-50 text-amber-600"
    },
    {
      icon: Shield,
      title: "Secure OAuth2",
      description: "Enterprise-grade security with OAuth2 authentication protocol",
      color: "bg-slate-50 text-slate-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                <BookOpen className="text-white" size={36} />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                ClearBooks Integration
              </h1>

              <p className="text-lg text-blue-600 font-medium mb-2">
                Data Management Dashboard
              </p>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Streamline your workflow with powerful tools to manage customers, businesses, and data operations efficiently.
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

            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500 mb-4">
                Trusted by businesses worldwide
              </p>
              <div className="flex justify-center gap-6 opacity-40">
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Powerful Features
            </h2>

            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className={`${feature.color} p-3 rounded-lg shrink-0`}>
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

import { LogIn, LogOut } from "lucide-react";

export default function AuthButton({ isAuthenticated, onLogin, onLogout, loading = false }) {
  if (isAuthenticated) {
    return (
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors border border-red-200 font-medium text-sm shadow-sm"
      >
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    );
  }

  return (
    <button
      onClick={onLogin}
      disabled={loading}
      className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed text-base"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <LogIn size={20} />
          <span>Connect ClearBooks</span>
        </>
      )}
    </button>
  );
}

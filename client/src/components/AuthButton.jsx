import { LogIn, LogOut } from 'lucide-react';

export default function AuthButton({ isAuthenticated, onLogin, onLogout, loading }) {
  if (loading) {
    return (
      <button
        disabled
        className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (isAuthenticated) {
    return (
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        <LogOut size={20} />
        Disconnect
      </button>
    );
  }

  return (
    <button
      onClick={onLogin}
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
    >
      <LogIn size={20} />
      Connect ClearBooks
    </button>
  );
}

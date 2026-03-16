import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Loading() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-slate-100/20"></div>

      <div className="relative">
        <div className="absolute inset-0 animate-pulse">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-slate-400/20 blur-2xl"></div>
        </div>

        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-12 min-w-[280px]">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500/10 to-slate-500/10 animate-pulse"></div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-blue-100/50 animate-ping"></div>
            </div>

            <div className="relative">
              <Loader2
                className="animate-spin text-blue-600 drop-shadow-lg"
                size={48}
                strokeWidth={2.5}
              />
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-700 text-lg font-medium tracking-wide">
              Loading<span className="inline-block w-6 text-left">{dots}</span>
            </p>
            <div className="mt-3 h-1 w-32 mx-auto bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-slate-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}

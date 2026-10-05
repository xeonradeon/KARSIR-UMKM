'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800/80 shadow-emerald-950/30'
                : isError
                ? 'bg-rose-950/90 text-rose-100 border-rose-800/80 shadow-rose-950/30'
                : isWarning
                ? 'bg-amber-950/90 text-amber-100 border-amber-800/80 shadow-amber-950/30'
                : 'bg-slate-900/95 text-slate-100 border-slate-700/80 shadow-slate-950/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {isError && <AlertCircle className="h-4 w-4 text-rose-400" />}
              {isWarning && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="h-4 w-4 text-blue-400" />}
            </div>

            <div className="flex-1 text-xs">
              {toast.title && <div className="font-bold mb-0.5">{toast.title}</div>}
              <div className="leading-relaxed opacity-95">{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-lg p-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

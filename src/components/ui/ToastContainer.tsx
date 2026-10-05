import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-[#1e232b]/95 text-[#f7f6f2] border-[#384152] shadow-[#16191e]/40'
                : isError
                ? 'bg-[#282d38]/95 text-[#f7f6f2] border-[#485368] shadow-[#16191e]/40'
                : isWarning
                ? 'bg-[#2c323e]/95 text-[#f7f6f2] border-[#4a556b] shadow-[#16191e]/40'
                : 'bg-[#181b21]/95 text-[#f7f6f2] border-[#363e4e] shadow-[#16191e]/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-4 w-4 text-[#e2ded6]" />}
              {isError && <AlertCircle className="h-4 w-4 text-[#c4cad4]" />}
              {isWarning && <AlertTriangle className="h-4 w-4 text-[#d8d3c7]" />}
              {!isSuccess && !isError && !isWarning && <Info className="h-4 w-4 text-[#d8d3c7]" />}
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

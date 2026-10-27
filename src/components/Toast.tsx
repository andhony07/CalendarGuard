import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCalendarGuard } from '../context/CalendarGuardContext';

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useCalendarGuard();

  if (!toast) return null;

  return (
    <div
      role="status"
      data-testid="toast-notification"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2"
    >
      {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
      {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-600" />}
      {toast.type === 'info' && <Info className="h-4 w-4 text-indigo-600" />}

      <span className="text-xs font-semibold text-slate-800">{toast.message}</span>

      <button
        onClick={dismissToast}
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Dismiss toast"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, description?: string, duration?: number) => void;
    error: (title: string, description?: string, duration?: number) => void;
    warning: (title: string, description?: string, duration?: number) => void;
    info: (title: string, description?: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((variant: ToastVariant, title: string, description?: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, variant, title, description, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toastHelpers = {
    success: (title: string, description?: string, duration?: number) => addToast("success", title, description, duration),
    error: (title: string, description?: string, duration?: number) => addToast("error", title, description, duration),
    warning: (title: string, description?: string, duration?: number) => addToast("warning", title, description, duration),
    info: (title: string, description?: string, duration?: number) => addToast("info", title, description, duration),
  };

  return (
    <ToastContext.Provider value={{ toast: toastHelpers, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const variantStyles = {
    success: {
      border: "border-l-4 border-emerald-500",
      bg: "bg-white/95 text-slate-900 border-slate-200/80 shadow-emerald-500/10",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      progressBg: "bg-emerald-500",
    },
    error: {
      border: "border-l-4 border-rose-500",
      bg: "bg-white/95 text-slate-900 border-slate-200/80 shadow-rose-500/10",
      icon: <XCircle className="h-5 w-5 text-rose-500 shrink-0" />,
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
      progressBg: "bg-rose-500",
    },
    warning: {
      border: "border-l-4 border-amber-500",
      bg: "bg-white/95 text-slate-900 border-slate-200/80 shadow-amber-500/10",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
      progressBg: "bg-amber-500",
    },
    info: {
      border: "border-l-4 border-blue-500",
      bg: "bg-white/95 text-slate-900 border-slate-200/80 shadow-blue-500/10",
      icon: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
      progressBg: "bg-blue-500",
    },
  };

  const style = variantStyles[toast.variant];

  return (
    <div
      className={`pointer-events-auto relative flex items-start gap-3 p-4 rounded-xl border ${style.border} ${style.bg} shadow-xl backdrop-blur-md transition-all duration-300 transform translate-x-0 opacity-100 overflow-hidden animate-slide-in-right`}
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="text-xs font-bold text-slate-800 leading-tight">{toast.title}</h4>
        {toast.description && (
          <p className="text-[11px] text-slate-600 mt-1 leading-normal break-words font-medium">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Subtle Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 h-[3px] ${style.progressBg} opacity-80`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

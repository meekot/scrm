"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

type Toast = {
  id: number;
  title: string;
  description?: string;
};

type ToastContextValue = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    setToasts((current) => [...current, { id: Date.now(), ...toast }]);
    setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ toasts, addToast }), [toasts, addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="w-full max-w-sm rounded-md border border-border bg-card p-4 shadow-lg"
          >
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description ? (
              <p className="text-sm text-muted-foreground">{toast.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

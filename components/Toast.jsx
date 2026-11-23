"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { IconCheck, IconX, IconSparkles } from "./Icons";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, variant = "success", ms = 3800) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((current) => [...current, { id, message, variant }]);
      setTimeout(() => dismiss(id), ms);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-[min(24rem,calc(100vw-3rem))] flex-col gap-2.5"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const isSuccess = t.variant === "success";
          const isError = t.variant === "error";
          return (
            <div
              key={t.id}
              onClick={() => dismiss(t.id)}
              className={`pointer-events-auto animate-fade-up flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium shadow-dock backdrop-blur-2xl transition-all cursor-pointer ${
                isSuccess
                  ? "border-emerald-500/30 bg-ink/90 text-emerald-200 shadow-glow-emerald"
                  : isError
                  ? "border-rose-500/30 bg-ink/90 text-rose-200"
                  : "border-accent/30 bg-ink/90 text-indigo-200 shadow-glow"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${
                  isSuccess
                    ? "bg-emerald-500/20 text-emerald-400"
                    : isError
                    ? "bg-rose-500/20 text-rose-400"
                    : "bg-accent/20 text-accent-soft"
                }`}
              >
                {isSuccess ? (
                  <IconCheck className="h-4 w-4" />
                ) : isError ? (
                  <IconX className="h-4 w-4" />
                ) : (
                  <IconSparkles className="h-4 w-4" />
                )}
              </div>
              <p className="flex-1 text-xs sm:text-sm text-white/90 leading-snug">{t.message}</p>
              <button className="text-white/40 hover:text-white transition-colors">
                <IconX className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}

"use client";

import { useEffect } from "react";
import { IconX } from "./Icons";

export default function Modal({ open, onClose, title, subtitle, children, width = "max-w-2xl" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-neutral-900/40 p-0 backdrop-blur-sm transition-all sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`w-full ${width} max-h-[92vh] animate-slide-up overflow-hidden rounded-b-none sm:rounded-3xl border border-neutral-200/90 bg-white shadow-dock`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-neutral-100 bg-neutral-50/60 px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-heading text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-xs text-neutral-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Close"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(92vh-5rem)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

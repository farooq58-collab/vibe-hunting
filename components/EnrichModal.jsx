"use client";

import Modal from "./Modal";
import { IconMail, IconPhone, IconGlobe, IconCheck, IconX, IconSparkles, IconBookmark } from "./Icons";

const ROWS = [
  { key: "email", icon: IconMail, label: "Email Address", href: (v) => `mailto:${v}` },
  { key: "phone", icon: IconPhone, label: "Phone Line", href: (v) => `tel:${v}` },
  { key: "whatsapp", icon: IconPhone, label: "WhatsApp Direct", href: (v) => v },
  { key: "instagram", icon: IconGlobe, label: "Instagram", href: (v) => v },
  { key: "facebook", icon: IconGlobe, label: "Facebook Page", href: (v) => v },
  { key: "linkedin", icon: IconGlobe, label: "LinkedIn", href: (v) => v },
  { key: "twitter", icon: IconGlobe, label: "X / Twitter", href: (v) => v },
];

export default function EnrichModal({ open, onClose, lead, result, loading, error, onSave }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lead?.name || "Website Audit & Contact Scraping"}
      subtitle={lead?.website || "No website on record"}
      width="max-w-2xl"
    >
      {loading && (
        <div className="space-y-4 p-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto animate-spin">
            <IconSparkles className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold text-neutral-800">
            Scraping &amp; Auditing website: <span className="text-blue-600">{lead?.website}</span>...
          </p>
          <div className="space-y-2.5 max-w-md mx-auto pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && result && (
        <div className="space-y-5">
          {result.title && (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">Scraped Metadata</p>
              <p className="text-sm font-bold text-neutral-900">{result.title}</p>
              {result.description && (
                <p className="line-clamp-3 text-xs text-neutral-600 leading-relaxed">{result.description}</p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200 overflow-hidden bg-white shadow-xs">
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs font-semibold text-neutral-900">
              <span>Contact Channel Findings</span>
              <span className="text-emerald-700 font-mono">{result.found_count} Channels Discovered</span>
            </div>

            <ul className="divide-y divide-neutral-100">
              {ROWS.map((row) => {
                const value = result[row.key];
                const Icon = row.icon;
                return (
                  <li key={row.key} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px] w-28 shrink-0">
                        {row.label}
                      </span>
                      {value ? (
                        <a
                          href={row.href(value)}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="min-w-0 flex-1 truncate text-blue-600 font-medium hover:underline"
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="text-neutral-400 font-mono text-[11px]">Not Found</span>
                      )}
                    </div>

                    <div>
                      {value ? (
                        <span className="chip-found text-[10px]">
                          <IconCheck className="h-3 w-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="chip-muted text-[10px]">Missing</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1">
            <span>{result.pages_scanned} Pages Scanned</span>
            <span>Public Open Web Search Data</span>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <button className="btn-primary flex-1 py-2.5 text-xs font-bold" onClick={onSave}>
              <IconBookmark className="h-4 w-4" />
              <span>Save Enriched Lead to CRM</span>
            </button>
            <button className="btn-secondary py-2.5 px-4 text-xs" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

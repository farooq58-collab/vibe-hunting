"use client";

import { TONE_STYLES } from "@/lib/score";
import {
  IconFlame,
  IconGlobe,
  IconPhone,
  IconMail,
  IconMapPin,
  IconSparkles,
  IconLightning,
  IconBookmark,
  IconCheck,
  IconChevronRight,
  IconSearch,
} from "./Icons";

const CONTACT_FIELDS = [
  { key: "email", icon: IconMail, label: "Email", href: (v) => `mailto:${v}` },
  { key: "phone", icon: IconPhone, label: "Phone", href: (v) => `tel:${v}` },
  { key: "whatsapp", icon: IconPhone, label: "WhatsApp", href: (v) => v },
  { key: "instagram", icon: IconGlobe, label: "Instagram", href: (v) => v },
  { key: "facebook", icon: IconGlobe, label: "Facebook", href: (v) => v },
  { key: "website", icon: IconGlobe, label: "Website", href: (v) => v },
];

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export default function LeadCard({
  lead,
  onEnrich,
  onGenerate,
  onSave,
  onConfirmNoWebsite,
  onClientPlan,
  enriching,
  saved,
  selected,
  onToggleSelect,
}) {
  const { rating } = lead;
  const vetoed = rating.vetoes.length > 0;
  const isHot = rating.tier === "Hot";

  return (
    <article
      className={`rounded-2xl border bg-white flex animate-fade-up flex-col p-5 relative overflow-hidden transition-all duration-200 shadow-card hover:shadow-card-hover ${
        selected ? "border-blue-600 ring-2 ring-blue-500/30" : "border-neutral-200/90 hover:border-neutral-300"
      } ${vetoed ? "opacity-60" : ""}`}
    >
      {/* Top tier strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isHot
            ? "bg-rose-500"
            : rating.tier === "Warm"
            ? "bg-amber-500"
            : "bg-neutral-200"
        }`}
      />

      <header className="flex items-start gap-3 pt-1">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(lead)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-blue-600 cursor-pointer accent-blue-600 focus:ring-blue-500"
          aria-label={`Select ${lead.name}`}
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-base font-bold text-neutral-900 tracking-tight" title={lead.name}>
            {lead.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-neutral-500">
            <IconMapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{lead.address || "Address not listed"}</span>
            {lead.distance_km != null && <span className="font-mono text-neutral-400">· {lead.distance_km} km</span>}
          </p>
        </div>

        {/* Tier chip */}
        <span
          className={`shrink-0 chip ${
            isHot
              ? "border-rose-200 bg-rose-50 text-rose-700 font-bold"
              : rating.tier === "Warm"
              ? "border-amber-200 bg-amber-50 text-amber-800 font-bold"
              : "border-neutral-200 bg-neutral-100 text-neutral-600"
          }`}
        >
          {isHot && <IconFlame className="h-3.5 w-3.5 text-rose-600" />}
          <span>{rating.tier}</span>
          <span className="font-mono opacity-60 text-[10px]">({rating.cell})</span>
        </span>
      </header>

      {/* Rationale */}
      <p className="mt-3 text-xs sm:text-sm text-neutral-700 leading-relaxed">{rating.summary}</p>
      <p className="mt-2.5 text-xs leading-relaxed text-neutral-800 font-medium bg-neutral-50 border border-neutral-200/80 p-2.5 rounded-xl">
        <span className="text-blue-600 font-semibold mr-1">⚡ Angle:</span> {rating.action}
      </p>

      {/* Contact attributes */}
      <div className="mt-3 space-y-1.5 text-xs bg-neutral-50/70 p-2.5 rounded-xl border border-neutral-200/80 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-14 text-neutral-400 uppercase text-[10px] font-semibold">Phone</span>
          <span className="truncate flex-1 text-neutral-900 font-medium">
            {lead.phone ? (
              <a href={`tel:${lead.phone}`} className="hover:text-blue-600 transition-colors">
                {lead.phone}
              </a>
            ) : (
              <span className="text-neutral-400 font-normal">Not listed</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-14 text-neutral-400 uppercase text-[10px] font-semibold">Site</span>
          <span className="truncate flex-1">
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer noopener"
                className="text-blue-600 font-medium hover:underline"
              >
                {hostOf(lead.website)}
              </a>
            ) : (
              <span className="text-amber-700 font-medium">⚠️ No website on OSM</span>
            )}
          </span>
        </div>
      </div>

      {/* Extra contact badges */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {CONTACT_FIELDS.filter((field) => lead[field.key]).map((field) => {
          const Icon = field.icon;
          return (
            <a
              key={field.key}
              href={field.href(lead[field.key])}
              target="_blank"
              rel="noreferrer noopener"
              className="chip border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              title={`${field.label}: ${lead[field.key]}`}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden xs:inline">{field.label}</span>
            </a>
          );
        })}
      </div>

      {/* Card Action Buttons */}
      <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-neutral-100">
        {lead.website ? (
          <button className="btn-secondary text-xs py-2" onClick={() => onEnrich(lead)} disabled={enriching}>
            <IconSparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>{enriching ? "Auditing..." : lead.site_audit ? "Re-Audit" : "Enrich"}</span>
          </button>
        ) : (
          <a
            className="btn-secondary text-xs py-2 justify-center"
            href={`https://duckduckgo.com/?q=${encodeURIComponent(`${lead.name} ${lead.city || ""}`)}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <IconSearch className="h-3.5 w-3.5 text-neutral-500" />
            <span>Search site</span>
          </a>
        )}

        <button className="btn-primary text-xs py-2 font-bold" onClick={() => onGenerate(lead)}>
          <span>Write Pitch</span>
          <IconChevronRight className="h-3 w-3" />
        </button>

        <button
          className={saved ? "btn-secondary text-xs py-2 text-emerald-700 border-emerald-200 bg-emerald-50" : "btn-secondary text-xs py-2"}
          onClick={() => onSave(lead)}
        >
          <IconBookmark className="h-3.5 w-3.5" />
          <span>{saved ? "Saved" : "Save Lead"}</span>
        </button>

        <button className="btn-secondary text-xs py-2" onClick={() => onClientPlan(lead)}>
          <span>📑 Plan</span>
        </button>

        {!lead.website && !lead.website_absent_confirmed && (
          <button
            className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-[11px] py-1.5 col-span-2 font-medium transition-colors"
            onClick={() => onConfirmNoWebsite(lead)}
          >
            <IconCheck className="h-3 w-3 inline mr-1 text-amber-600" />
            <span>Confirmed — Genuinely has no website</span>
          </button>
        )}
      </div>
    </article>
  );
}

"use client";

import { IconFlame, IconGlobe, IconCheck, IconBookmark, IconSparkles, IconFilter, IconChevronRight } from "./Icons";

const SORTS = [
  { id: "score", label: "Opportunity Fit Score" },
  { id: "distance", label: "Closest Location" },
  { id: "name", label: "Alphabetical (A–Z)" },
];

const FILTERS = [
  { key: "hotOnly", label: "Hot prospects", icon: IconFlame, hint: "High-grade opportunity fit" },
  { key: "noWebsite", label: "Missing website", icon: IconGlobe, hint: "Strongest pitch for web work" },
  { key: "hasPhone", label: "Has phone", icon: null, hint: "Reachable immediately" },
  { key: "hideSaved", label: "Unsaved only", icon: IconBookmark, hint: "Leads not in CRM" },
];

function StatCard({ value, label, trend, isHighlight }) {
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 relative overflow-hidden transition-all duration-200 ${
        isHighlight
          ? "border-blue-200 bg-blue-50/40 shadow-xs"
          : "border-neutral-200/90 bg-white shadow-xs"
      }`}
    >
      <div className="flex justify-between items-start">
        <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">{label}</p>
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-700">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-neutral-900">{value}</p>

      {/* Mini SVG Sparkline */}
      <div className="h-6 w-full mt-3 opacity-70">
        <svg className="h-full w-full" viewBox="0 0 100 20">
          <path
            d="M 0 15 Q 25 5, 50 12 T 100 2"
            fill="none"
            stroke={isHighlight ? "#2563EB" : "#94A3B8"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default function ResultsToolbar({
  result,
  stats,
  visibleCount,
  sort,
  setSort,
  filters,
  setFilters,
  selectedCount,
  onSelectAll,
  onClearSelection,
  onBulkEnrich,
  onBulkSave,
  bulk,
}) {
  const toggle = (key) => setFilters((f) => ({ ...f, [key]: !f[key] }));

  return (
    <div className="mb-8 space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-neutral-200/80 pb-4">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2.5">
            <span>Discovered {visibleCount} of {stats.total} Leads</span>
            <span className="inline-flex items-center rounded-lg border border-neutral-200 bg-neutral-100/80 px-2.5 py-0.5 text-xs font-mono font-medium text-neutral-700">
              {result.niche} in {result.city}
            </span>
          </h2>
          <p className="mt-1 text-xs text-neutral-500 font-mono">
            Radius: {result.radius_km} km {result.cached ? " · Cached OSM query" : " · Live OpenStreetMap data"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs py-1.5 px-3" onClick={onSelectAll}>
            Select visible ({visibleCount})
          </button>
          <button className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5" onClick={onBulkEnrich}>
            <IconSparkles className="h-3.5 w-3.5" />
            <span>Enrich visible</span>
          </button>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={stats.total} label="Total Leads Found" trend="+100% OSM" isHighlight={true} />
        <StatCard value={stats.hot} label="🔥 Hot Prospects" trend="+14% High Fit" isHighlight={false} />
        <StatCard value={stats.warm} label="Warm Prospects" trend="+32% Warm Fit" isHighlight={false} />
        <StatCard value={stats.audited} label="Audited Websites" trend="Scraped" isHighlight={false} />
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-neutral-500 uppercase text-[11px] font-semibold">Sort:</span>
          <select
            className="rounded-xl border border-neutral-200 bg-neutral-50/80 px-3 py-1.5 font-semibold text-neutral-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 cursor-pointer"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((filter) => {
            const active = filters[filter.key];
            return (
              <button
                key={filter.key}
                onClick={() => toggle(filter.key)}
                title={filter.hint}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "border-blue-300 bg-blue-50 text-blue-700 shadow-xs"
                    : "border-neutral-200 bg-neutral-100/70 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900"
                }`}
              >
                {active ? "✓ " : ""}
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk progress indicator */}
      {bulk && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              <span>Enriching {bulk.done} of {bulk.total} lead websites...</span>
            </span>
            <span className="text-emerald-700 font-mono">{bulk.found} Contacts Found</span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.round((bulk.done / bulk.total) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Floating Selection Dock */}
      {selectedCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up flex items-center gap-3 rounded-full border border-neutral-300/80 bg-white/95 px-5 py-2.5 shadow-dock backdrop-blur-md">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white">
            {selectedCount}
          </span>
          <span className="text-xs font-semibold text-neutral-700 pr-2 border-r border-neutral-200">Selected</span>

          <button className="btn-ghost py-1 px-3 text-xs" onClick={onClearSelection}>
            Clear
          </button>
          <button className="btn-secondary py-1 px-3 text-xs" onClick={onBulkEnrich}>
            Enrich selected
          </button>
          <button className="btn-primary py-1 px-4 text-xs font-bold" onClick={onBulkSave}>
            <span>Save to CRM</span>
            <IconChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

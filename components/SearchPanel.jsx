"use client";

import { useState } from "react";
import Link from "next/link";
import { NICHES, getNiche, OTHER_NICHE } from "@/lib/niches";
import { IconSearch, IconMapPin, IconLightning, IconSparkles, IconX } from "./Icons";

const CITY_SUGGESTIONS = ["Karachi", "Lahore", "Dubai", "London", "Manchester", "New York", "Singapore"];

export default function SearchPanel({
  nicheId,
  setNicheId,
  term,
  setTerm,
  city,
  setCity,
  radius,
  setRadius,
  loading,
  onSearch,
  recent,
  niche,
}) {
  const isCustom = nicheId === OTHER_NICHE.id;

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-76px)] flex flex-col justify-center py-4 sm:py-6">
      {/* Hero Header Section */}
      <div className="relative mx-auto max-w-4xl text-center pb-5 sm:pb-7">
        {/* Top Tag Pill */}
        <Link
          href="/mcp"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/80 hover:bg-white hover:border-blue-300 px-4 py-1 text-xs font-mono font-medium text-neutral-600 hover:text-blue-600 shadow-2xs backdrop-blur-sm mb-3 transition-colors cursor-pointer group"
        >
          <IconSparkles className="h-3.5 w-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
          <span>NPX &amp; MCP Ready · Connect with Claude, Cursor, ChatGPT &amp; Other LLMs &rarr;</span>
        </Link>

        {/* Serif Headline with Royal Blue Italic Highlight */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] text-neutral-900 tracking-tight leading-[1.12] text-center font-normal">
          Discover High-Value <span className="italic text-blue-600 font-serif">Local &amp; International</span>
          <br />
          Business Leads
        </h1>

        {/* Subtitle */}
        <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Instantly mine local and international businesses across B2B &amp; B2C, detect website &amp; contact gaps, rate sales opportunity fit, and generate AI-crafted outreach pitches in seconds.
        </p>
      </div>

      {/* Main Search White Card */}
      <div className="rounded-3xl border border-neutral-200/90 bg-white shadow-card p-5 sm:p-6 lg:p-7">
        <div className="grid gap-3.5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,0.7fr)_auto]">
          {/* Industry Niche */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-700" htmlFor="niche">
                Industry Niche
              </label>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200/80 text-[10px] font-mono font-medium text-teal-700">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                100% CALIBRATED
              </span>
            </div>

            <div className="relative">
              <select
                id="niche"
                className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white px-4 py-3 pr-10 text-sm font-medium text-neutral-900 cursor-pointer focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={nicheId}
                onChange={(e) => setNicheId(e.target.value)}
              >
                {NICHES.map((n) => (
                  <option key={n.id} value={n.id} className="py-2 text-neutral-900">
                    {n.emoji} {n.label}
                  </option>
                ))}
                <option value={OTHER_NICHE.id} className="py-2 text-neutral-900">
                  {OTHER_NICHE.emoji} {OTHER_NICHE.label}
                </option>
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {isCustom && (
              <div className="relative mt-2">
                <input
                  id="term"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white px-4 py-2.5 pl-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSearch()}
                  placeholder="e.g. bakery, car wash, physiotherapist…"
                  autoComplete="off"
                  autoFocus
                />
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
            )}
          </div>

          {/* Target City / Region */}
          <div>
            <div className="mb-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-700" htmlFor="city">
                Target City / Region
              </label>
            </div>
            <div className="relative">
              <input
                id="city"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white px-4 py-3 pl-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="e.g. Karachi, Dubai, London, New York..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                autoComplete="off"
              />
              <IconMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              {city && (
                <button
                  type="button"
                  onClick={() => setCity("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <IconX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Radius */}
          <div>
            <div className="mb-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-700" htmlFor="radius">
                Search Radius
              </label>
            </div>
            <div className="relative">
              <select
                id="radius"
                className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white px-4 py-3 text-center font-mono text-sm text-neutral-800 cursor-pointer focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              >
                {[5000, 10000, 20000, 35000, 50000].map((r) => (
                  <option key={r} value={r}>
                    {r / 1000} km
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Button: Find Leads */}
          <div className="flex items-end">
            <button
              type="button"
              className="w-full h-[46px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl px-7 flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onSearch()}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Scanning OSM...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <IconLightning className="h-4 w-4" />
                  <span>Find Leads</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mt-4 pt-3.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono font-semibold uppercase tracking-wider text-[10px] text-neutral-400 mr-1">
              Popular Cities:
            </span>
            {CITY_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setCity(suggestion)}
                className="rounded-lg border border-neutral-200/80 bg-neutral-100/80 hover:bg-neutral-200/80 text-neutral-700 px-2.5 py-0.5 text-xs font-medium transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono font-semibold uppercase tracking-wider text-[10px] text-neutral-400 mr-1">
              Recent Searches:
            </span>
            {recent.length > 0 ? (
              recent.map((entry) => {
                const entryNiche = getNiche(entry.nicheId);
                return (
                  <button
                    key={`${entry.nicheId}-${entry.term || ""}-${entry.city}`}
                    type="button"
                    onClick={() => onSearch(entry)}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 px-2.5 py-0.5 text-xs font-medium transition-colors"
                  >
                    <span>{entryNiche?.emoji || OTHER_NICHE.emoji}</span>
                    <span>{entryNiche?.label || entry.label || entry.term} • {entry.city}</span>
                  </button>
                );
              })
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNicheId("plumbers");
                  setCity("Karachi");
                  onSearch({ nicheId: "plumbers", city: "Karachi" });
                }}
                className="flex items-center gap-1.5 rounded-lg border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 px-2.5 py-0.5 text-xs font-medium transition-colors"
              >
                <span>🔧</span>
                <span>Plumbers • Karachi</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Pain Point Intelligence Callout */}
        {niche && (
          <div className="mt-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-3 sm:p-3.5 flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white border border-neutral-200/80 text-blue-600 shadow-2xs">
              <IconSparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                <span>{niche.emoji}</span>
                <span>Industry Pain Point Calibrated:</span>
              </p>
              <p className="mt-0.5 text-xs text-neutral-600 leading-relaxed font-normal">
                "{niche.painPoint}"
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

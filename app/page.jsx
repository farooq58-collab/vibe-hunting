"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NICHES, getNiche } from "@/lib/niches";
import { nicheFor } from "@/lib/customNiche";
import { rateLead, withRatings } from "@/lib/score";
import { saveLead, listLeads } from "@/lib/leadsRepo";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import LeadCard from "@/components/LeadCard";
import LeadSkeleton from "@/components/LeadSkeleton";
import EnrichModal from "@/components/EnrichModal";
import OutreachGenerator from "@/components/OutreachGenerator";
import SearchPanel from "@/components/SearchPanel";
import ResultsToolbar from "@/components/ResultsToolbar";
import { IconSearch, IconSparkles } from "@/components/Icons";
import { ModuleSticker } from "@/components/DocSticker";

const RECENT_KEY = "leadforge.recent.v1";
const MARKET_KEY = "leadforge.market.v1";
const ENRICH_CONCURRENCY = 3;

export default function DiscoverPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, isLocalMode } = useAuth();
  const secondPageRef = useRef(null);

  const [nicheId, setNicheId] = useState(NICHES[0].id);
  const [term, setTerm] = useState("");
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState(20000);
  const [recent, setRecent] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [leads, setLeads] = useState([]);

  const [sort, setSort] = useState("score");
  const [filters, setFilters] = useState({
    hotOnly: false,
    noWebsite: false,
    hasPhone: false,
    hideSaved: false,
  });
  const [selected, setSelected] = useState(new Set());

  const [savedKeys, setSavedKeys] = useState(new Set());
  const [enrichState, setEnrichState] = useState({ open: false, lead: null, loading: false });
  const [enrichResult, setEnrichResult] = useState(null);
  const [enrichError, setEnrichError] = useState(null);
  const [enrichingId, setEnrichingId] = useState(null);
  const [bulk, setBulk] = useState(null);
  const [outreachLead, setOutreachLead] = useState(null);
  const [groqReady, setGroqReady] = useState(true);

  const niche = useMemo(() => nicheFor(nicheId, term, getNiche), [nicheId, term]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    listLeads(user.id)
      .then((rows) => setSavedKeys(new Set(rows.map((r) => r.osm_id).filter(Boolean))))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c) => setGroqReady(c.groq))
      .catch(() => {});
  }, []);

  function rememberSearch(entry) {
    setRecent((current) => {
      const deduped = current.filter(
        (r) =>
          !(
            r.nicheId === entry.nicheId &&
            (r.term || "") === (entry.term || "") &&
            r.city.toLowerCase() === entry.city.toLowerCase()
          )
      );
      const next = [entry, ...deduped].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }

  const runSearch = useCallback(
    async (override = {}) => {
      const searchNiche = override.nicheId || nicheId;
      const searchTerm = (override.term ?? term).trim();
      const searchCity = (override.city ?? city).trim();
      const searchRadius = override.radius || radius;

      if (searchNiche === "other" && !searchTerm) {
        toast("Type the trade you want to find", "error");
        return;
      }
      if (!searchCity) {
        toast("Enter a city first", "error");
        return;
      }

      setNicheId(searchNiche);
      setTerm(searchTerm);
      setCity(searchCity);
      setRadius(searchRadius);
      setLoading(true);
      setError(null);
      setResult(null);
      setLeads([]);
      setSelected(new Set());

      // Auto-scroll to second page to view search progress
      setTimeout(() => {
        secondPageRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 120);

      try {
        const params = new URLSearchParams({
          niche: searchNiche,
          term: searchTerm,
          city: searchCity,
          radius: searchRadius,
        });
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 80000);
        let response;
        try {
          response = await fetch(`/api/leads?${params}`, { signal: controller.signal });
        } catch (err) {
          throw err.name === "AbortError"
            ? new Error("Search timed out — OpenStreetMap servers busy. Try again.")
            : err;
        } finally {
          clearTimeout(timer);
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Search failed.");

        setResult(data);
        const searchNicheObj = nicheFor(searchNiche, searchTerm, getNiche);
        const rated = withRatings(data.leads, searchNicheObj);
        setLeads(rated);

        setTimeout(() => {
          secondPageRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 120);

        localStorage.setItem(
          MARKET_KEY,
          JSON.stringify({
            niche: data.niche,
            nicheId: searchNiche,
            city: data.city,
            radius_km: data.radius_km,
            total: rated.length,
            withPhone: rated.filter((l) => l.phone).length,
            audited: 0,
            withDefects: 0,
            captured_at: new Date().toISOString(),
          })
        );
        if (data.count) {
          rememberSearch({
            nicheId: searchNiche,
            term: searchTerm,
            label: data.niche,
            city: data.city,
            radius: searchRadius,
          });
        }
        toast(
          data.count
            ? `${data.count} leads found in ${data.city}`
            : "No results on OpenStreetMap for that search",
          data.count ? "success" : "info"
        );
      } catch (err) {
        setError(err.message);
        toast(err.message, "error");
      } finally {
        setLoading(false);
      }
    },
    [nicheId, city, radius, toast]
  );

  const enrichOne = useCallback(
    async (lead) => {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: lead.website }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enrichment failed.");

      setLeads((current) =>
        current.map((l) => {
          if (l.osm_id !== lead.osm_id) return l;
          const merged = {
            ...l,
            email: l.email || data.email,
            phone: l.phone || data.phone,
            instagram: l.instagram || data.instagram,
            facebook: l.facebook || data.facebook,
            whatsapp: l.whatsapp || data.whatsapp,
            linkedin: l.linkedin || data.linkedin,
            site_audit: data.site_audit,
            enriched: true,
            enrichedCount: data.found_count,
          };
          return { ...merged, rating: rateLead(merged, niche) };
        })
      );
      return data;
    },
    [niche]
  );

  function handleClientPlan(lead) {
    localStorage.setItem(
      "leadforge.gtm.lead.v1",
      JSON.stringify({
        name: lead.name,
        niche: lead.niche,
        niche_id: lead.niche_id,
        niche_term: lead.niche_term,
        city: lead.city,
        address: lead.address,
        phone: lead.phone,
        email: lead.email,
        website: lead.website,
        instagram: lead.instagram,
        facebook: lead.facebook,
        opening_hours: lead.opening_hours,
        site_audit: lead.site_audit || null,
      })
    );
    router.push("/gtm");
  }

  function confirmNoWebsite(lead) {
    setLeads((current) =>
      current.map((l) => {
        if (l.osm_id !== lead.osm_id) return l;
        const merged = { ...l, website_absent_confirmed: true, website_checked: true };
        return { ...merged, rating: rateLead(merged, niche) };
      })
    );
    toast("Recorded — no website confirmed", "success");
  }

  async function handleEnrich(lead) {
    setEnrichingId(lead.osm_id);
    setEnrichState({ open: true, lead, loading: true });
    setEnrichResult(null);
    setEnrichError(null);
    try {
      const data = await enrichOne(lead);
      setEnrichResult(data);
      toast(
        data.found_count
          ? `${data.found_count} contact channel${data.found_count === 1 ? "" : "s"} found`
          : "Website scraped — no public contacts found",
        data.found_count ? "success" : "info"
      );
    } catch (err) {
      setEnrichError(err.message);
      toast(err.message, "error");
    } finally {
      setEnrichState((s) => ({ ...s, loading: false }));
      setEnrichingId(null);
    }
  }

  async function handleBulkEnrich(targets) {
    const queue = targets.filter((l) => l.website && !l.enriched);
    if (!queue.length) {
      toast("Nothing left to enrich — leads have no website or are done", "info");
      return;
    }

    setBulk({ done: 0, total: queue.length, found: 0 });
    let found = 0;
    let index = 0;

    async function worker() {
      while (index < queue.length) {
        const item = queue[index++];
        try {
          const res = await enrichOne(item);
          found += res.found_count || 0;
        } catch {
          /* ignore */
        } finally {
          setBulk((b) => (b ? { ...b, done: b.done + 1, found } : null));
        }
      }
    }

    await Promise.all(Array.from({ length: ENRICH_CONCURRENCY }, worker));
    toast(`Bulk enrich complete: ${found} contacts uncovered`, "success");
    setBulk(null);
  }

  async function handleSave(lead) {
    try {
      await saveLead(lead, user?.id);
      setSavedKeys((keys) => new Set([...keys, lead.osm_id]));
      toast(`Saved "${lead.name}" to CRM`, "success");
    } catch (err) {
      toast(err.message, "error");
    }
  }

  async function handleBulkSave(targets) {
    if (!targets.length) return;
    try {
      for (const lead of targets) {
        await saveLead(lead, user?.id);
      }
      setSavedKeys((keys) => new Set([...keys, ...targets.map((l) => l.osm_id)]));
      toast(`Saved ${targets.length} leads to CRM`, "success");
    } catch (err) {
      toast(err.message, "error");
    }
  }

  function toggleSelect(lead) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(lead.osm_id)) next.delete(lead.osm_id);
      else next.add(lead.osm_id);
      return next;
    });
  }

  const visible = useMemo(() => {
    return leads
      .filter((lead) => {
        if (filters.hotOnly && lead.rating.tier !== "Hot") return false;
        if (filters.noWebsite && lead.website) return false;
        if (filters.hasPhone && !lead.phone) return false;
        if (filters.hideSaved && savedKeys.has(lead.osm_id)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "distance") {
          return (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity);
        }
        if (sort === "name") {
          return a.name.localeCompare(b.name);
        }
        return b.rating.score - a.rating.score;
      });
  }, [leads, filters, sort, savedKeys]);

  const selectedLeads = useMemo(
    () => leads.filter((l) => selected.has(l.osm_id)),
    [leads, selected]
  );

  const stats = useMemo(
    () => ({
      total: leads.length,
      hot: leads.filter((l) => l.rating.tier === "Hot").length,
      warm: leads.filter((l) => l.rating.tier === "Warm").length,
      audited: leads.filter((l) => l.site_audit).length,
    }),
    [leads]
  );

  const currentEnrichedLead =
    leads.find((l) => l.osm_id === enrichState.lead?.osm_id) || enrichState.lead;

  return (
    <div className="w-full">
      {/* SCREEN 1: Full-Screen Hero & Search Console */}
      <SearchPanel
        nicheId={nicheId}
        setNicheId={setNicheId}
        term={term}
        setTerm={setTerm}
        city={city}
        setCity={setCity}
        radius={radius}
        setRadius={setRadius}
        loading={loading}
        onSearch={runSearch}
        recent={recent}
        niche={niche}
      />

      {/* Results & Intelligence Section */}
      <section
        ref={secondPageRef}
        id="results-section"
        className="w-full py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-t border-neutral-200/80 bg-white/60 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl">

          {!groqReady && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-800">
              ⚠️ No <code className="text-amber-900 font-mono font-semibold">GROQ_API_KEY</code> set — Lead search works, but AI pitch generator requires an API key.
            </div>
          )}

          {loading && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-sm text-blue-600 font-semibold animate-pulse">
                <IconSparkles className="h-5 w-5" />
                <span>Querying OpenStreetMap servers for {niche.label} in {city}...</span>
              </div>
              <LeadSkeleton count={6} />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              ⚠️ Error: {error}
            </div>
          )}

          {!loading && result && leads.length === 0 && (
            <div className="rounded-3xl border border-neutral-200/90 bg-white shadow-card p-12 text-center max-w-lg mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 mx-auto mb-4 border border-neutral-200">
                <IconSearch className="h-6 w-6" />
              </div>
              <p className="font-heading text-xl font-bold text-neutral-900">No OpenStreetMap Leads Found</p>
              <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
                No businesses indexed matching "{niche.label}" in {city}. Try expanding your search radius to 35km or try a nearby city.
              </p>
            </div>
          )}

          {/* 100% Free GTM Engineering Feature Suite */}
          {!loading && !result && leads.length === 0 && (
            <div className="space-y-12">
              {/* Header Banner */}
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1 text-xs font-mono font-bold text-blue-700 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>100% FREE GTM ENGINEERING PLATFORM</span>
                </div>
                <h2 className="font-heading text-2xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                  Full-Stack Go-To-Market Engineering
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                  End-to-end B2B &amp; B2C lead intelligence, technical defect auditing, opportunity rating, and AI multi-channel outreach engine — 100% free with zero API credits or monthly subscriptions.
                </p>
              </div>

              {/* 6 Core GTM Engineering Modules */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* 1: Open Data Mining */}
                <div className="group rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs hover:border-neutral-300 transition-all">
                  <ModuleSticker module="01" />
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">Module 01</span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-[10px] font-mono font-semibold text-neutral-500">Global Geocoding</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-neutral-900">Open Data Market Intelligence</h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Instantly queries OpenStreetMap nodes and geocoded POIs across 100+ calibrated niches. Pulls addresses, direct phone numbers, coordinates, and operating hours worldwide with 0 API fees.
                  </p>
                </div>

                {/* 2: Opportunity Scoring */}
                <div className="group rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs hover:border-neutral-300 transition-all">
                  <ModuleSticker module="02" />
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600">Module 02</span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-[10px] font-mono font-semibold text-neutral-500">0–100 Rating</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-neutral-900">Proprietary Opportunity Fit Engine</h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Two-axis scoring model evaluating customer fit and digital opportunity. Automatically detects and prioritizes businesses operating without a website, missing booking funnels, or lacking online presence.
                  </p>
                </div>

                {/* 3: Deep Technical Audit */}
                <div className="group rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs hover:border-neutral-300 transition-all">
                  <ModuleSticker module="03" />
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600">Module 03</span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-[10px] font-mono font-semibold text-neutral-500">Conversion Crawler</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-neutral-900">Deep Website &amp; Gap Audit</h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Crawls business websites in seconds to discover verified emails, direct WhatsApp numbers, and social channels (Instagram, LinkedIn, Facebook). Audits SSL, viewport responsiveness, and booking flows.
                  </p>
                </div>

                {/* 4: Multi-Channel Outreach */}
                <div className="group rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs hover:border-neutral-300 transition-all">
                  <ModuleSticker module="04" />
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600">Module 04</span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-[10px] font-mono font-semibold text-neutral-500">5 Channels</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-neutral-900">AI Multi-Touch Cold Outreach</h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Generates 1-click tailored pitches across 5 formats: Cold Email, WhatsApp Message, Phone Cold Calling Script, LinkedIn DM, and 3-Touch Follow-up Sequences citing verified prospect defects.
                  </p>
                </div>

                {/* 5: GTM Strategy & Proposals */}
                <div className="group rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs hover:border-neutral-300 transition-all">
                  <ModuleSticker module="05" />
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600">Module 05</span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-[10px] font-mono font-semibold text-neutral-500">Agency Blueprints</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-neutral-900">GTM Strategy &amp; Proposal Studio</h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Compiles comprehensive Go-To-Market blueprints, competitive positioning decks, client-facing service proposals, and technical defect audit reports formatted in high-converting Markdown.
                  </p>
                </div>

                {/* 6: Open MCP Server */}
                <div className="group rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between">
                  <div>
                    <ModuleSticker module="06" />
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-600">Module 06</span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-[10px] font-mono font-semibold text-neutral-500">100% Free Open Source</span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-neutral-900">@vibe-hunter MCP Server</h3>
                    <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      Open-source Model Context Protocol agent. Run locally or with universal 1-click NPX (<code className="bg-neutral-100 text-neutral-800 font-mono font-bold px-1.5 py-0.5 rounded text-[11px]">npx -y vibe-hunter-mcp</code>) across Claude Desktop, Cursor, and Windsurf.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <Link
                      href="/mcp"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>Open Source MCP Setup</span>
                      <span>→</span>
                    </Link>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      NPX READY
                    </span>
                  </div>
                </div>
              </div>

              {/* 4-Step GTM Engineering Pipeline */}
              <div className="rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-card">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    ENGINEERING PLAYBOOK
                  </span>
                  <h3 className="font-heading text-xl font-bold text-neutral-900 mt-1">
                    The 4-Step GTM Pipeline
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="relative rounded-2xl border border-neutral-100 bg-neutral-50/60 p-5">
                    <span className="font-mono text-xs font-bold text-blue-600">STEP 01</span>
                    <h4 className="font-heading text-sm font-bold text-neutral-900 mt-1.5">Mine &amp; Geocode</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Scan geographic radii across global OSM mirrors with concurrent failover.
                    </p>
                  </div>

                  <div className="relative rounded-2xl border border-neutral-100 bg-neutral-50/60 p-5">
                    <span className="font-mono text-xs font-bold text-emerald-600">STEP 02</span>
                    <h4 className="font-heading text-sm font-bold text-neutral-900 mt-1.5">Rate Opportunity</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Score fit (0–100) and highlight businesses operating without modern web funnels.
                    </p>
                  </div>

                  <div className="relative rounded-2xl border border-neutral-100 bg-neutral-50/60 p-5">
                    <span className="font-mono text-xs font-bold text-purple-600">STEP 03</span>
                    <h4 className="font-heading text-sm font-bold text-neutral-900 mt-1.5">Audit Defects</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Scrape contacts (emails, phones, WhatsApp) and verify conversion bottlenecks.
                    </p>
                  </div>

                  <div className="relative rounded-2xl border border-neutral-100 bg-neutral-50/60 p-5">
                    <span className="font-mono text-xs font-bold text-amber-600">STEP 04</span>
                    <h4 className="font-heading text-sm font-bold text-neutral-900 mt-1.5">Generate Pitches</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Produce high-converting cold pitches citing verified gaps ready to send.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1-Click Quick Launch Searches */}
              <div className="rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-card text-center">
                <p className="font-heading text-base sm:text-lg font-bold text-neutral-900">
                  Ready to test? Launch an instant @vibe-hunter discovery:
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Click any query to trigger automated lead mining with verified opportunity scoring:
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  {[
                    { label: "🔧 Plumbers • Karachi", prompt: "@vibe-hunter plumbers in Karachi", niche: "plumbers", city: "Karachi" },
                    { label: "🦷 Dentists • London", prompt: "@vibe-hunter dentists in London", niche: "dentists", city: "London" },
                    { label: "🏋️ Gyms • Dubai", prompt: "@vibe-hunter gyms in Dubai", niche: "gyms", city: "Dubai" },
                    { label: "⚡ Electricians • New York", prompt: "@vibe-hunter electricians in New York", niche: "electricians", city: "New York" },
                    { label: "🍕 Restaurants • Manchester", prompt: "@vibe-hunter restaurants in Manchester", niche: "restaurants", city: "Manchester" },
                  ].map((demo) => (
                    <button
                      key={demo.label}
                      type="button"
                      onClick={() => {
                        setNicheId(demo.niche);
                        setCity(demo.city);
                        runSearch({ nicheId: demo.niche, city: demo.city });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 px-3.5 py-2 text-xs font-semibold text-blue-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      <span className="text-[10px] font-mono font-bold text-blue-500 bg-white/80 px-1 py-0.5 rounded border border-blue-200">
                        @vibe-hunter
                      </span>
                      <span>{demo.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && leads.length > 0 && (
            <>
              <ResultsToolbar
                result={result}
                stats={stats}
                visibleCount={visible.length}
                sort={sort}
                setSort={setSort}
                filters={filters}
                setFilters={setFilters}
                selectedCount={selected.size}
                onSelectAll={() => setSelected(new Set(visible.map((l) => l.osm_id)))}
                onClearSelection={() => setSelected(new Set())}
                onBulkEnrich={() => handleBulkEnrich(selectedLeads.length ? selectedLeads : visible)}
                onBulkSave={() => handleBulkSave(selectedLeads)}
                bulk={bulk}
              />

              {visible.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200/90 bg-white p-10 text-center text-sm text-neutral-500">
                  No leads match your active filters. Try clearing a filter toggle above.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((lead) => (
                    <LeadCard
                      key={lead.osm_id}
                      lead={lead}
                      enriching={enrichingId === lead.osm_id || Boolean(bulk)}
                      saved={savedKeys.has(lead.osm_id)}
                      selected={selected.has(lead.osm_id)}
                      onToggleSelect={toggleSelect}
                      onEnrich={handleEnrich}
                      onGenerate={setOutreachLead}
                      onSave={handleSave}
                      onConfirmNoWebsite={confirmNoWebsite}
                      onClientPlan={handleClientPlan}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          <EnrichModal
            open={enrichState.open}
            onClose={() => setEnrichState({ open: false, lead: null, loading: false })}
            lead={enrichState.lead}
            result={enrichResult}
            loading={enrichState.loading}
            error={enrichError}
            onSave={() => {
              handleSave(currentEnrichedLead);
              setEnrichState({ open: false, lead: null, loading: false });
            }}
          />

          <OutreachGenerator
            open={Boolean(outreachLead)}
            onClose={() => setOutreachLead(null)}
            lead={outreachLead}
            onSave={async (leadWithOutreach) => {
              await handleSave(leadWithOutreach);
              setOutreachLead(null);
            }}
          />
        </div>
      </section>
    </div>
  );
}

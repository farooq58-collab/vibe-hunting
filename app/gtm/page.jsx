"use client";

import { useEffect, useMemo, useState } from "react";
import { GTM_DOCS } from "@/lib/gtm";
import { CLIENT_DOCS } from "@/lib/clientGtm";
import { NICHES } from "@/lib/niches";
import { listLeads } from "@/lib/leadsRepo";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import Markdown from "@/components/Markdown";
import { IconTarget, IconSparkles, IconCopy, IconDownload, IconRefresh } from "@/components/Icons";
import DocSticker from "@/components/DocSticker";

const BRIEF_KEY = "vibe_hunting.gtm.brief.v1";
const MARKET_KEY = "vibe_hunting.market.v1";
const DOCS_KEY = "vibe_hunting.gtm.docs.v1";
const HANDOFF_KEY = "vibe_hunting.gtm.lead.v1";

const EMPTY_BRIEF = {
  author: "",
  company: "",
  service: "",
  currency: "$",
  oneOff: "",
  monthly: "",
  differentiator: "",
  nicheId: NICHES[0].id,
  city: "",
  preparedFor: "",
};

export default function GtmStudioPage() {
  const toast = useToast();
  const { user } = useAuth();

  const [subject, setSubject] = useState("self");
  const [brief, setBrief] = useState(EMPTY_BRIEF);
  const [market, setMarket] = useState(null);
  const [useMarket, setUseMarket] = useState(true);

  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState(null);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    try {
      const storedBrief = localStorage.getItem(BRIEF_KEY) || localStorage.getItem("leadforge.gtm.brief.v1");
      if (storedBrief) setBrief({ ...EMPTY_BRIEF, ...JSON.parse(storedBrief) });
      const storedMarket = localStorage.getItem(MARKET_KEY) || localStorage.getItem("leadforge.market.v1");
      if (storedMarket) setMarket(JSON.parse(storedMarket));
      const storedDocs = localStorage.getItem(DOCS_KEY) || localStorage.getItem("leadforge.gtm.docs.v1");
      if (storedDocs) setSaved(JSON.parse(storedDocs));

      const handoff = localStorage.getItem(HANDOFF_KEY) || localStorage.getItem("leadforge.gtm.lead.v1");
      if (handoff) {
        setSelectedLead(JSON.parse(handoff));
        setSubject("client");
        localStorage.removeItem(HANDOFF_KEY);
        localStorage.removeItem("leadforge.gtm.lead.v1");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    listLeads(user.id)
      .then(setLeads)
      .catch(() => {});
  }, [user]);

  const update = (patch) => {
    const next = { ...brief, ...patch };
    setBrief(next);
    localStorage.setItem(BRIEF_KEY, JSON.stringify(next));
  };

  const catalogue = subject === "self" ? GTM_DOCS : CLIENT_DOCS;
  const doc = useMemo(() => catalogue.find((d) => d.id === docId) || null, [catalogue, docId]);

  async function generate(id) {
    const target = catalogue.find((d) => d.id === id);

    if (subject === "self" && !brief.service.trim()) {
      toast("Fill in your agency service offer first", "error");
      return;
    }
    if (subject === "client" && !selectedLead) {
      toast("Pick a business lead first", "error");
      return;
    }

    setDocId(id);
    setLoading(true);
    setError(null);

    try {
      const payload =
        subject === "self"
          ? { subject: "self", docId: id, brief, market: useMarket ? market : null }
          : { subject: "client", docId: id, brief, lead: selectedLead };

      const res = await fetch("/api/gtm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");

      setOutput({
        markdown: data.markdown,
        usage: data.usage,
        finish_reason: data.finish_reason,
        doc: target,
        subject: subject === "client" ? selectedLead?.name : brief.company || null,
        audited: data.audited,
      });

      const nextSaved = [
        {
          id: `${Date.now()}`,
          docId: id,
          name: target.name,
          subject,
          forWhom: subject === "client" ? selectedLead?.name : brief.company || brief.service,
          markdown: data.markdown,
          created_at: new Date().toISOString(),
        },
        ...saved.filter((s) => s.docId !== id || s.forWhom !== (subject === "client" ? selectedLead?.name : brief.company)),
      ].slice(0, 20);

      setSaved(nextSaved);
      localStorage.setItem(DOCS_KEY, JSON.stringify(nextSaved));
      toast(`Generated "${target.name}" deliverable`, "success");
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!output) return;
    const blob = new Blob([output.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${output.doc.id}-${(output.subject || "gtm").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-mono font-medium text-blue-700 mb-3">
            <IconTarget className="h-4 w-4 text-blue-600" />
            <span>AI Go-To-Market &amp; Growth Deliverables Studio</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-neutral-900 tracking-tight sm:text-4xl">
            GTM Strategy Hub
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500">
            Generate high-converting positioning documents, cold pitch blueprints, and client-facing growth proposals.
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-100/80 p-1.5 flex gap-1.5 max-w-md shadow-xs">
        <button
          onClick={() => setSubject("self")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            subject === "self"
              ? "bg-white text-neutral-900 shadow-xs border border-neutral-200/80"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
          }`}
        >
          <IconSparkles className="h-4 w-4 text-blue-600" />
          <span>For My Agency / Business</span>
        </button>

        <button
          onClick={() => setSubject("client")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            subject === "client"
              ? "bg-white text-neutral-900 shadow-xs border border-neutral-200/80"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
          }`}
        >
          <span>For a Specific Client</span>
        </button>
      </div>

      {/* Inputs Form Section */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-card space-y-4">
        {subject === "self" ? (
          <>
            <h2 className="font-heading text-lg font-bold text-neutral-900 flex items-center gap-2">
              <span>Agency &amp; Offer Parameters</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Your Name / Agency</label>
                <input
                  className="field"
                  placeholder="e.g. Apex Digital Growth"
                  value={brief.company}
                  onChange={(e) => update({ company: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Primary Offer / Service</label>
                <input
                  className="field"
                  placeholder="e.g. Website Redesign & Lead Funnels"
                  value={brief.service}
                  onChange={(e) => update({ service: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Pricing Model</label>
                <input
                  className="field"
                  placeholder="e.g. $1,500 setup + $300/mo"
                  value={brief.oneOff}
                  onChange={(e) => update({ oneOff: e.target.value })}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-heading text-lg font-bold text-neutral-900">Select Target Client Lead</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Saved Lead</label>
                <select
                  className="field appearance-none cursor-pointer"
                  value={selectedLead?.osm_id || ""}
                  onChange={(e) => {
                    const found = leads.find((l) => String(l.osm_id) === e.target.value);
                    setSelectedLead(found || null);
                  }}
                >
                  <option value="" className="bg-white text-neutral-900">Select a saved lead...</option>
                  {leads.map((lead) => (
                    <option key={lead.osm_id || lead.id} value={lead.osm_id} className="bg-white text-neutral-900">
                      {lead.name} ({lead.niche || "Business"} · {lead.city || "City"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Client Prepared For</label>
                <input
                  className="field"
                  placeholder="e.g. Dr. Smith / Business Owner"
                  value={brief.preparedFor}
                  onChange={(e) => update({ preparedFor: e.target.value })}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Document Templates Grid */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Available Deliverable Templates ({catalogue.length})
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {catalogue.map((entry) => {
            const blocked = subject === "client" && entry.needsAudit && !selectedLead?.site_audit;
            const isSelected = docId === entry.id;
            return (
              <button
                key={entry.id}
                onClick={() => generate(entry.id)}
                disabled={loading || blocked}
                className={`group rounded-2xl border bg-white flex flex-col p-5 text-left transition-all duration-200 shadow-card hover:shadow-card-hover ${
                  isSelected ? "border-blue-600 ring-2 ring-blue-500/20" : "border-neutral-200/90 hover:border-neutral-300"
                } ${blocked ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <DocSticker id={entry.id} />
                  <span className="chip-found text-[10px]">
                    {subject === "client" ? (entry.sellable ? "Sellable Asset" : "Pitch Doc") : entry.audience}
                  </span>
                </div>
                <h3 className="mt-3 font-heading text-base font-bold text-neutral-900 tracking-tight">{entry.name}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-neutral-500">{entry.blurb}</p>
                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>{entry.length}</span>
                  <span className="text-blue-600 font-semibold">{blocked ? "Needs Website Audit" : "Ready to Generate ⚡"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Output Document Section */}
      {loading && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 space-y-4 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto animate-spin">
            <IconSparkles className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-neutral-800">
            Synthesizing AI Strategy Deliverable for {doc?.name}...
          </p>
          <div className="space-y-2 max-w-xl mx-auto pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-3 w-full rounded-md" />
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          ⚠️ Error: {error}
        </div>
      )}

      {output && !loading && (
        <div className="rounded-3xl border border-neutral-200/90 bg-white overflow-hidden shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <DocSticker id={output.doc.id} className="h-9 w-9 !rounded-xl" />
              <div>
                <h2 className="font-heading text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <span>{output.doc.name}</span>
                  {output.subject && <span className="text-xs text-blue-600 font-mono">({output.subject})</span>}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn-secondary text-xs py-1.5 px-3"
                onClick={async () => {
                  await navigator.clipboard.writeText(output.markdown);
                  toast("Document copied to clipboard", "success");
                }}
              >
                <IconCopy className="h-3.5 w-3.5" />
                <span>Copy Markdown</span>
              </button>
              <button className="btn-primary text-xs py-1.5 px-3 font-bold" onClick={download}>
                <IconDownload className="h-3.5 w-3.5" />
                <span>Download .md</span>
              </button>
              <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => generate(output.doc.id)}>
                <IconRefresh className="h-3.5 w-3.5" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          <div className="max-h-[75vh] overflow-y-auto p-6 sm:p-8 font-sans">
            <Markdown>{output.markdown}</Markdown>
          </div>
        </div>
      )}

      {/* Saved Documents */}
      {saved.length > 0 && !loading && (
        <div className="pt-4 border-t border-neutral-200/80">
          <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-neutral-500 font-mono">
            Recent Generated Documents ({saved.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {saved.slice(0, 10).map((record) => (
              <button
                key={record.id}
                onClick={() =>
                  setOutput({
                    markdown: record.markdown,
                    doc: { id: record.docId, name: record.name },
                    subject: record.forWhom,
                  })
                }
                className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-blue-300 hover:text-blue-700 shadow-2xs"
              >
                {record.name} {record.forWhom && `· ${record.forWhom}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

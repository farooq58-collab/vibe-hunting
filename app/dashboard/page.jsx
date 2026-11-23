"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CRMTable from "@/components/CRMTable";
import Modal from "@/components/Modal";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { listLeads, updateLead, deleteLead } from "@/lib/leadsRepo";
import { downloadCsv } from "@/lib/csv";
import { sendOptions } from "@/lib/outreachLinks";
import { STATUSES } from "@/lib/niches";
import { IconCopy, IconDownload, IconSearch, IconSparkles, IconCheck, IconSend } from "@/components/Icons";

const ALL = "All";

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading: authLoading, isLocalMode } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [niche, setNiche] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [viewing, setViewing] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setNotes(viewing?.notes || "");
  }, [viewing]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    listLeads(user.id)
      .then(setLeads)
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [user, authLoading, router, toast]);

  const niches = useMemo(
    () => [ALL, ...new Set(leads.map((l) => l.niche).filter(Boolean))],
    [leads]
  );
  const cities = useMemo(
    () => [ALL, ...new Set(leads.map((l) => l.city).filter(Boolean))],
    [leads]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (niche !== ALL && lead.niche !== niche) return false;
      if (city !== ALL && lead.city !== city) return false;
      if (status !== ALL && (lead.status || "New") !== status) return false;
      if (!needle) return true;
      return [lead.name, lead.email, lead.phone, lead.address, lead.website, lead.city]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [leads, query, niche, city, status]);

  async function handleStatusChange(lead, nextStatus) {
    const previous = lead.status;
    setLeads((rows) =>
      rows.map((r) => (r.id === lead.id ? { ...r, status: nextStatus } : r))
    );
    try {
      await updateLead(lead.id, { status: nextStatus }, user.id);
      toast(`${lead.name} → ${nextStatus}`, "success");
    } catch (err) {
      setLeads((rows) =>
        rows.map((r) => (r.id === lead.id ? { ...r, status: previous } : r))
      );
      toast(err.message, "error");
    }
  }

  async function handleDelete(lead) {
    if (!window.confirm(`Delete "${lead.name}" from your CRM?`)) return;
    const snapshot = leads;
    setLeads((rows) => rows.filter((r) => r.id !== lead.id));
    try {
      await deleteLead(lead.id, user.id);
      toast("Lead deleted from CRM", "info");
    } catch (err) {
      setLeads(snapshot);
      toast(err.message, "error");
    }
  }

  async function handleSaveNotes() {
    try {
      await updateLead(viewing.id, { notes }, user.id);
      setLeads((rows) => rows.map((r) => (r.id === viewing.id ? { ...r, notes } : r)));
      toast("Lead notes updated", "success");
    } catch (err) {
      toast(err.message, "error");
    }
  }

  async function handleCopyEmails() {
    const emails = [...new Set(filtered.map((l) => l.email).filter(Boolean))];
    if (!emails.length) {
      toast("No email contacts in current filtered view", "error");
      return;
    }
    await navigator.clipboard.writeText(emails.join(", "));
    toast(`${emails.length} email${emails.length === 1 ? "" : "s"} copied to clipboard`, "success");
  }

  function handleExport() {
    if (!filtered.length) {
      toast("Nothing to export with current filters", "error");
      return;
    }
    downloadCsv(filtered, `vibe-hunting-crm-${new Date().toISOString().slice(0, 10)}.csv`);
    toast(`Exported ${filtered.length} lead${filtered.length === 1 ? "" : "s"} to CSV`, "success");
  }

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    for (const lead of leads) byStatus[lead.status || "New"] = (byStatus[lead.status || "New"] || 0) + 1;
    return byStatus;
  }, [leads]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-10 sm:px-6">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/80 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-neutral-900 tracking-tight sm:text-4xl">
            Lead CRM Pipeline
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 flex items-center gap-2 font-mono">
            <span>{leads.length} total saved leads in database</span>
            {isLocalMode && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] text-amber-800 font-mono font-medium">
                Local Browser Mode
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button className="btn-secondary text-xs py-2 px-4" onClick={handleCopyEmails}>
            <IconCopy className="h-3.5 w-3.5 text-blue-600" />
            <span>Copy Emails</span>
          </button>
          <button className="btn-primary text-xs py-2 px-4 font-bold" onClick={handleExport}>
            <IconDownload className="h-3.5 w-3.5" />
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Pipeline Status Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUSES.map((s) => {
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => setStatus(status === s ? ALL : s)}
              className={`rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                active
                  ? "border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20"
                  : "border-neutral-200/90 bg-white shadow-card hover:border-neutral-300"
              }`}
            >
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-neutral-900">{counts[s] || 0}</p>
              <p className="mt-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-500">{s}</p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 shadow-card">
        <div className="relative">
          <input
            className="field pl-9"
            placeholder="Search lead name, email, phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        </div>

        <select className="field appearance-none cursor-pointer" value={niche} onChange={(e) => setNiche(e.target.value)}>
          {niches.map((option) => (
            <option key={option} value={option} className="bg-white text-neutral-900">
              {option === ALL ? "All Niches" : option}
            </option>
          ))}
        </select>

        <select className="field appearance-none cursor-pointer" value={city} onChange={(e) => setCity(e.target.value)}>
          {cities.map((option) => (
            <option key={option} value={option} className="bg-white text-neutral-900">
              {option === ALL ? "All Cities" : option}
            </option>
          ))}
        </select>

        <select className="field appearance-none cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value)}>
          {[ALL, ...STATUSES].map((option) => (
            <option key={option} value={option} className="bg-white text-neutral-900">
              {option === ALL ? "All Statuses" : option}
            </option>
          ))}
        </select>
      </div>

      {/* Main Leads CRM Table Component */}
      <CRMTable
        leads={filtered}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onViewOutreach={setViewing}
      />

      {/* Lead Detail Drawer Modal */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name || "Lead Details"}
        subtitle={[viewing?.niche, viewing?.city].filter(Boolean).join(" · ")}
      >
        <div className="space-y-5">
          {viewing && sendOptions(viewing).length > 0 && (
            <div>
              <p className="label flex items-center gap-1.5 text-neutral-700">
                <IconSend className="h-3.5 w-3.5 text-blue-600" />
                <span>Launch Direct Outreach</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {sendOptions(viewing).map((option) => (
                  <a
                    key={option.key}
                    href={option.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-secondary flex-1 text-xs py-2"
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {viewing?.outreach ? (
            <div>
              <p className="label flex items-center justify-between text-neutral-700">
                <span>AI Cold Pitch Script</span>
                <button
                  className="text-blue-600 hover:underline text-[11px] font-mono"
                  onClick={async () => {
                    await navigator.clipboard.writeText(viewing.outreach);
                    toast("Outreach script copied to clipboard", "success");
                  }}
                >
                  Copy Script 📋
                </button>
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 font-mono text-xs leading-relaxed text-neutral-800 max-h-60 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans">{viewing.outreach}</pre>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 text-xs text-neutral-500">
              No outreach pitch script generated yet. You can write one anytime from the Discover page.
            </div>
          )}

          <div>
            <label className="label" htmlFor="notes">
              Internal CRM Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="field resize-y text-xs"
              placeholder="e.g. Spoke with owner on Tuesday. Follow up regarding site redesign quote next Monday..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button className="btn-primary mt-3 w-full text-xs font-bold py-2.5" onClick={handleSaveNotes}>
              Save Lead Notes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

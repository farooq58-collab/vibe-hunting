"use client";

import { STATUSES, STATUS_STYLES } from "@/lib/niches";
import { IconMail, IconPhone, IconGlobe, IconBuilding, IconCheck } from "./Icons";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function StatusSelect({ lead, onStatusChange }) {
  return (
    <select
      value={lead.status || "New"}
      onChange={(e) => onStatusChange(lead, e.target.value)}
      className={`chip cursor-pointer font-mono text-xs outline-none px-3 py-1.5 rounded-xl border transition-all ${
        STATUS_STYLES[lead.status] || STATUS_STYLES.New
      }`}
    >
      {STATUSES.map((status) => (
        <option key={status} value={status} className="bg-white text-neutral-900">
          {status}
        </option>
      ))}
    </select>
  );
}

function ContactPill({ lead }) {
  const channels = [
    lead.email && { icon: IconMail, href: `mailto:${lead.email}`, title: lead.email, color: "text-emerald-600" },
    lead.phone && { icon: IconPhone, href: `tel:${lead.phone}`, title: lead.phone, color: "text-blue-600" },
    lead.website && { icon: IconGlobe, href: lead.website, title: hostOf(lead.website), color: "text-indigo-600" },
  ].filter(Boolean);

  if (!channels.length) return <span className="text-xs text-neutral-400 font-mono">No direct contact</span>;

  return (
    <div className="flex items-center gap-1.5">
      {channels.map((ch, idx) => {
        const Icon = ch.icon;
        return (
          <a
            key={idx}
            href={ch.href}
            target="_blank"
            rel="noreferrer noopener"
            title={ch.title}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 transition hover:border-blue-300 hover:bg-blue-50"
          >
            <Icon className={`h-3.5 w-3.5 ${ch.color}`} />
          </a>
        );
      })}
    </div>
  );
}

export default function CRMTable({ leads, onStatusChange, onDelete, onViewOutreach }) {
  if (!leads.length) {
    return (
      <div className="rounded-3xl border border-neutral-200/90 bg-white p-12 text-center max-w-md mx-auto shadow-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 mx-auto mb-4 border border-neutral-200">
          <IconBuilding className="h-6 w-6" />
        </div>
        <p className="font-heading text-xl font-bold text-neutral-900">No Saved CRM Leads Yet</p>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
          Save high-potential leads from the Discover page to manage outreach, sequence status, and custom pitch notes right here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white hidden overflow-hidden md:block shadow-card">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="border-b border-neutral-100 bg-neutral-50/80 text-[11px] uppercase tracking-wider text-neutral-500 font-mono">
            <tr>
              <th className="px-5 py-4 font-bold">Company &amp; Address</th>
              <th className="px-5 py-4 font-bold">Niche &amp; City</th>
              <th className="px-5 py-4 font-bold">Channels</th>
              <th className="px-5 py-4 font-bold">Pipeline Stage</th>
              <th className="px-5 py-4 font-bold">Date Saved</th>
              <th className="px-5 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="transition hover:bg-neutral-50/60 group">
                <td className="max-w-[18rem] px-5 py-4">
                  <p className="truncate font-heading text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors" title={lead.name}>
                    {lead.name}
                  </p>
                  {lead.address && (
                    <p className="truncate text-xs text-neutral-500 mt-0.5" title={lead.address}>
                      {lead.address}
                    </p>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                    <span>{lead.niche || "General"}</span>
                    {lead.city && <span className="text-neutral-400 font-mono">· {lead.city}</span>}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <ContactPill lead={lead} />
                </td>

                <td className="px-5 py-4">
                  <StatusSelect lead={lead} onStatusChange={onStatusChange} />
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-xs font-mono text-neutral-400">
                  {formatDate(lead.created_at)}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="btn-secondary py-1.5 px-3 text-xs"
                      onClick={() => onViewOutreach(lead)}
                      title="Open lead details, AI pitch & notes"
                    >
                      <span>{lead.outreach ? "Outreach ⚡" : "View"}</span>
                    </button>
                    <button
                      className="btn-ghost py-1.5 px-2.5 text-xs text-rose-600 hover:bg-rose-50"
                      onClick={() => onDelete(lead)}
                      title="Delete lead"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="space-y-4 md:hidden">
        {leads.map((lead) => (
          <div key={lead.id} className="rounded-2xl border border-neutral-200/90 bg-white p-5 space-y-3 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-heading text-base font-bold text-neutral-900">{lead.name}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {[lead.niche, lead.city].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <StatusSelect lead={lead} onStatusChange={onStatusChange} />
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <ContactPill lead={lead} />
            </div>

            <div className="flex items-center justify-between pt-2 text-xs border-t border-neutral-100">
              <span className="font-mono text-neutral-400">{formatDate(lead.created_at)}</span>
              <div className="flex items-center gap-2">
                <button className="btn-secondary py-1 px-3 text-xs" onClick={() => onViewOutreach(lead)}>
                  {lead.outreach ? "Pitch ⚡" : "Details"}
                </button>
                <button className="btn-ghost py-1 px-2.5 text-xs text-rose-600 hover:bg-rose-50" onClick={() => onDelete(lead)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

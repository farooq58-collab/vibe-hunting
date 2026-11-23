"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { GOALS, CHANNELS, TONES } from "@/lib/niches";
import { verifiedAngles } from "@/lib/score";
import { useToast } from "./Toast";
import { IconSparkles, IconCopy, IconRefresh, IconBookmark, IconLightning } from "./Icons";

const CHANNEL_HINT = {
  "Cold Email": "Subject line + high-converting short body pitch ready to send.",
  "WhatsApp Message": "Under 90 words, direct value hook, single call-to-action.",
  "Cold Call Script": "Full call script with opening, value hook, and 2 objection handlers.",
  "LinkedIn DM": "Under 70 words, casual & conversational, no external links.",
  "3-Touch Sequence": "Complete multi-touch sequence (Email → WhatsApp → Follow-up).",
};

function Segmented({ label, options, value, onChange }) {
  return (
    <div>
      <span className="label text-[11px] text-neutral-600">{label}</span>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs"
                  : "border-neutral-200 bg-neutral-50/70 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function OutreachGenerator({ open, onClose, lead, onSave }) {
  const toast = useToast();
  const [goal, setGoal] = useState(GOALS[0]);
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const angles = lead ? verifiedAngles(lead) : [];

  useEffect(() => {
    setMessage("");
    setError(null);
  }, [lead?.osm_id, lead?.id]);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: {
            name: lead.name,
            city: lead.city,
            website: lead.website,
            phone: lead.phone,
            address: lead.address,
            email: lead.email,
            instagram: lead.instagram,
            facebook: lead.facebook,
            whatsapp: lead.whatsapp,
            opening_hours: lead.opening_hours,
            site_audit: lead.site_audit,
          },
          niche: lead.niche_id,
          term: lead.niche_term,
          goal,
          channel,
          tone,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setMessage(data.message);
      toast("AI Outreach Pitch Generated", "success");
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      toast("Script copied to clipboard", "success");
    } catch {
      toast("Clipboard access blocked by browser", "error");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="AI Outreach Generator"
      subtitle={lead ? `${lead.name} · ${lead.niche || "Business"} · ${lead.city || ""}` : ""}
      width="max-w-3xl"
    >
      <div className="space-y-5">
        {angles.length > 0 ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 border border-blue-200 shadow-2xs">
              <IconSparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                Verified Prospect Finding
              </p>
              <p className="mt-0.5 text-xs sm:text-sm font-bold text-neutral-900">{angles[0].label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">{angles[0].angle}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 text-xs text-neutral-600">
            {lead?.website
              ? "Run Enrich + Audit first to unlock deep defect angles for higher response rates."
              : "This business has no website on OpenStreetMap — the AI will craft a pitch offering a modern Web Presence."}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Segmented label="Campaign Goal" options={GOALS} value={goal} onChange={setGoal} />
          <Segmented label="Outreach Channel" options={CHANNELS} value={channel} onChange={setChannel} />
          <Segmented label="Tone of Voice" options={TONES} value={tone} onChange={setTone} />
        </div>

        <p className="text-xs font-mono text-neutral-500 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80">
          💡 Strategy Tip: {CHANNEL_HINT[channel]}
        </p>

        {!message && !loading && (
          <button className="btn-primary w-full py-3 text-base font-bold" onClick={generate}>
            <IconLightning className="h-5 w-5" />
            <span>Generate Pitch with AI Engine</span>
          </button>
        )}

        {loading && (
          <div className="space-y-3 p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mx-auto animate-spin">
              <IconSparkles className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-neutral-700">
              Drafting {tone.toLowerCase()} {channel.toLowerCase()} for {lead?.name}...
            </p>
            <div className="space-y-2 max-w-lg mx-auto pt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-3.5 w-full rounded-md" />
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
            ⚠️ {error}
          </div>
        )}

        {message && !loading && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5 font-sans text-xs sm:text-sm leading-relaxed text-neutral-800 max-h-72 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">{message}</pre>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button className="btn-secondary flex-1 py-2.5 text-xs font-semibold" onClick={copy}>
                <IconCopy className="h-4 w-4 text-blue-600" />
                <span>Copy to Clipboard</span>
              </button>
              <button className="btn-ghost flex-1 py-2.5 text-xs font-semibold" onClick={generate}>
                <IconRefresh className="h-4 w-4" />
                <span>Regenerate Pitch</span>
              </button>
              <button
                className="btn-primary flex-1 py-2.5 text-xs font-bold"
                onClick={() => onSave({ ...lead, outreach: message })}
              >
                <IconBookmark className="h-4 w-4" />
                <span>Save to CRM</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

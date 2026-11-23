import { json, fail, fetchWithTimeout } from "@/lib/server/http";
import { getClientDoc, leadFactSheet } from "@/lib/clientGtm";
import { getNiche } from "@/lib/niches";
import { nicheFor } from "@/lib/customNiche";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile"];

const money = (currency, n) => `${currency || "$"}${Math.round(n).toLocaleString("en-US")}`;

function buildPrompt({ doc, lead, audit, brief, niche }) {
  const today = new Date().toISOString().slice(0, 10);
  const facts = leadFactSheet(lead, audit);

  const oneOff = Number(brief.oneOff) || 0;
  const monthly = Number(brief.monthly) || 0;
  const pricingBlock =
    oneOff || monthly
      ? `PRE-COMPUTED PRICING — quote these figures verbatim, never recalculate:
- One-off fee: ${money(brief.currency, oneOff)}
- Monthly retainer: ${money(brief.currency, monthly)}
- First-year total: ${money(brief.currency, oneOff + monthly * 12)} (${money(brief.currency, oneOff)} + 12 × ${money(brief.currency, monthly)})`
      : "No pricing was supplied. Write [PRICING TO BE CONFIRMED] wherever a figure belongs. Do not invent one.";

  return `You are a marketing consultant preparing a professional document FOR a local business, on behalf of the consultant who will deliver it.

CRITICAL — WHO THIS IS ABOUT:
The subject of this document is "${lead.name}", a ${niche?.label || lead.niche || "local service business"} in ${lead.city || "their town"}.
The audience for the ADVICE is that business's own customers — the people who book and buy from them.
This document will be DELIVERED TO the business owner, potentially as a paid deliverable.
It is NOT about the consultant's business.

DOCUMENT TYPE: ${doc.name}
TARGET LENGTH: ${doc.length}

WHAT WE KNOW ABOUT THEM (from public listings):
${facts.known.join("\n")}

${
  facts.verified.length
    ? `WHAT WE ACTUALLY VERIFIED BY LOADING THEIR WEBSITE on ${today}:\n${facts.verified.join("\n")}`
    : "WEBSITE AUDIT: none performed."
}

WHAT WE DO NOT KNOW — these are UNKNOWN and you must NOT invent them:
${facts.unknown.join("\n")}

${niche ? `GENERAL PATTERN IN THIS TRADE (industry-level, not specific to this business):\n${niche.painPoint}` : ""}

PREPARED BY: ${brief.author}${brief.company ? `, ${brief.company}` : ""}
${brief.service ? `SERVICES THE CONSULTANT OFFERS: ${brief.service}` : ""}

${doc.id === "proposal" ? pricingBlock : ""}

REQUIRED STRUCTURE — use these as markdown headings, in this order:
${doc.sections.map((s, i) => `${i + 1}. ${s}`).join("\n")}

DOCUMENT HEADER — begin with a block containing:
Title · Prepared for: ${lead.name} · Prepared by: ${brief.author}${brief.company ? `, ${brief.company}` : ""} · Date: ${today} · Version: v1.0 · Classification: Confidential

THE INTEGRITY RULES — these matter more than the writing:
1. NEVER state a fact about this business that is not in the verified list above. No invented revenue, staff counts, review scores, customer numbers, competitor names or current marketing spend.
2. Where a number or detail is needed but unknown, write a bracketed placeholder such as [TO CONFIRM: current monthly enquiries] rather than guessing.
3. Distinguish clearly between "we verified this about YOUR site" and "this is the general pattern in your trade". Never present a trade generality as a finding about them.
4. Do not claim to have visited, phoned, or been a customer of the business.
5. If the website was not audited, do not describe their website at all.
6. Any benchmark or statistic must be given as a range and described as typical for the trade, never as a precise measured fact about them.
7. End the document with a short "What We Assumed" list naming every placeholder and assumption used.

STYLE:
- Write to a busy owner-operator who is not a marketer. Short sentences. Plain words. No jargon.
- Be specific and immediately actionable — every recommendation should be something they could start this week.
- Use markdown tables for anything tabular (findings, calendars, timelines, checklists).
- Output valid markdown only. No preamble and no closing commentary.`;
}

export async function POST(request) {
  if (!process.env.GROQ_API_KEY) {
    return fail("Groq API key not configured. Add GROQ_API_KEY to .env.local and restart.", 501, {
      code: "GROQ_NOT_CONFIGURED",
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Expected a JSON body: { docId, lead, brief }");
  }

  const doc = getClientDoc(body?.docId);
  if (!doc) return fail(`Unknown client document type "${body?.docId}".`);

  const lead = body.lead;
  if (!lead?.name) return fail("A lead with at least a name is required.");

  const brief = body.brief || {};
  if (!brief.author?.trim()) brief.author = "Your consultant";

  const audit = lead.site_audit || null;
  if (doc.needsAudit && !audit) {
    return fail(
      `${doc.name} needs a verified website audit first — run "Enrich + Audit" on this lead, otherwise the document would have nothing factual to report.`,
      400,
      { code: "AUDIT_REQUIRED" }
    );
  }

  const niche = nicheFor(lead.niche_id || brief.nicheId, lead.niche_term, getNiche);
  const prompt = buildPrompt({ doc, lead, audit, brief, niche });

  let response = null;
  let lastErrorText = "";
  let usedModel = MODELS[0];

  for (const modelToTry of MODELS) {
    try {
      usedModel = modelToTry;
      response = await fetchWithTimeout(
        GROQ_URL,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelToTry,
            messages: [
              { role: "system", content: prompt },
              {
                role: "user",
                content: `Produce the complete ${doc.name} for ${lead.name} now, following every section heading in order.`,
              },
            ],
            max_tokens: 3500,
            temperature: 0.5,
          }),
        },
        50000
      );

      if (response.ok) {
        break;
      }
      lastErrorText = await response.text().catch(() => "");
    } catch (err) {
      lastErrorText = err.message || "";
    }
  }

  if (!response || !response.ok) {
    if (response?.status === 429) {
      return fail("Groq rate limit hit. Wait a moment and try again.", 429);
    }
    return fail(`Groq responded with ${response?.status || 502}. ${lastErrorText.slice(0, 200)}`.trim(), 502);
  }

  const payload = await response.json();
  const markdown = payload.choices?.[0]?.message?.content?.trim();
  if (!markdown) return fail("Groq returned an empty document. Try again.", 502);

  return json({
    markdown,
    doc: { id: doc.id, name: doc.name },
    subject: lead.name,
    audited: Boolean(audit),
    model: usedModel,
    usage: payload.usage || null,
    finish_reason: payload.choices?.[0]?.finish_reason || null,
  });
}

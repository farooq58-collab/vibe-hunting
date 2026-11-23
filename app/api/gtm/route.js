import { json, fail, fetchWithTimeout } from "@/lib/server/http";
import { getDoc, CLASSIFICATIONS, computeSizing } from "@/lib/gtm";
import { getNiche } from "@/lib/niches";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile"];

/**
 * Market evidence block. This is what separates a generated GTM document from
 * generic AI output: the market sizing is bottom-up from the user's own search
 * results, which is the only sizing method that is defensible at local scale.
 */
function evidenceBlock(market) {
  if (!market?.total) {
    return "No market data attached. Do NOT invent counts, percentages or market sizes. Where a number is required, write a clearly-labelled placeholder such as [COUNT — run a search in LeadForge to fill this in].";
  }

  const lines = [
    `- Search performed: ${market.niche} within ${market.radius_km} km of ${market.city}`,
    `- Businesses found on OpenStreetMap: ${market.total}`,
    `- With a published phone number: ${market.withPhone}`,
  ];

  if (market.audited > 0) {
    lines.push(
      `- Websites actually audited: ${market.audited}`,
      `- Of those audited, verified defects found: ${market.withDefects} (not mobile-friendly, no booking form, stale content or no HTTPS)`
    );
  }

  lines.push(
    "",
    "CRITICAL DATA CAVEAT you must respect and state in the document:",
    "OpenStreetMap counts are a FLOOR, not a census — only businesses volunteers have mapped appear, and contact tags are sparse (roughly 9-15% of retail entries carry a website tag, which reflects mapping effort, NOT whether the business has a website). Never present these counts as the total market, and never infer that a business lacks a website because the tag is missing."
  );

  return lines.join("\n");
}

function buildPrompt({ doc, brief, market, niche }) {
  const today = new Date().toISOString().slice(0, 10);
  const sizing = computeSizing(market, brief);

  const metadata =
    doc.tier === 0
      ? `A header block with: document title, date (${today}), owner (${brief.author}), version (v1.0), and classification (${CLASSIFICATIONS[doc.audience]}).`
      : doc.tier === 1
        ? `A header block with: document title, date (${today}), prepared by (${brief.author}${brief.company ? `, ${brief.company}` : ""}), prepared for (${brief.preparedFor || "[CLIENT NAME]"}), version (v1.0), valid until (30 days from the date), and classification (${CLASSIFICATIONS[doc.audience]}). End with an Assumptions & Out-of-Scope section.`
        : `A title block (title, date ${today}, owner ${brief.author}, version v1.0, classification ${CLASSIFICATIONS[doc.audience]}), then a Contents list, then an Executive Summary of no more than 10% of the document. End with a Revision History table containing a single v1.0 row.`;

  return `You are a senior go-to-market strategist producing a formal, client-grade business document.

DOCUMENT TYPE: ${doc.name}
AUDIENCE: ${doc.audience}
TARGET LENGTH: ${doc.length}
METHODOLOGY LINEAGE: ${doc.lineage}

THE BUSINESS THIS DOCUMENT IS FOR (the seller):
- Operator: ${brief.author}${brief.company ? ` (${brief.company})` : ""}
- What they sell: ${brief.service}
- Price point: ${
    brief.oneOff || brief.monthly
      ? `${brief.currency || "$"}${brief.oneOff || 0} one-off + ${brief.currency || "$"}${brief.monthly || 0}/month`
      : "not stated"
  }
- Their edge: ${brief.differentiator || "not stated"}

THE MARKET THEY SELL INTO (the buyer):
- Target trade: ${niche ? niche.label : brief.targetNiche || "local service businesses"}
- Territory: ${brief.city || market?.city || "not stated"}
${niche ? `- Known pain in this trade: ${niche.painPoint}` : ""}

MARKET EVIDENCE (real data from this user's own lead search — use it, cite it, and do not contradict it):
${evidenceBlock(market)}
${
  sizing
    ? `\nPRE-COMPUTED FIGURES — these are already calculated correctly. Quote them
VERBATIM wherever sizing or revenue is discussed. Do NOT recalculate, re-derive
or adjust them, and do not introduce any money figure that is not listed here:
${sizing.lines.join("\n")}`
    : `\nNo pricing figures were supplied, so do NOT state any revenue or market-size
number. Write [PRICING TO BE CONFIRMED] instead.`
}

REQUIRED STRUCTURE — use these as the section headings, in this order, as markdown headings:
${doc.sections.map((s, i) => `${i + 1}. ${s}`).join("\n")}

${doc.guidance ? `SPECIFIC GUIDANCE: ${doc.guidance}\n` : ""}
FORMAL DOCUMENT REQUIREMENTS:
${metadata}

RULES:
- Output valid markdown only. No preamble, no "here is your document", no closing commentary.
- Be specific and decision-ready. Every section must contain real, usable content — never "TBD" or filler prose restating the heading.
- Use tables where the content is tabular (comparisons, touch tables, pricing tiers, milestones).
- Where a number is genuinely unknown, use a clearly-marked placeholder in square brackets rather than inventing it.
- Benchmarks must be given as ranges and attributed (e.g. "cold email reply rates typically run 3-5%"), never as false precision.
- Write for a working practitioner, not a boardroom. Short sentences. No management jargon, no "leverage synergies".
- This is for a small operator selling to local business owners — keep every recommendation affordable and executable by one or two people.`;
}

export async function POST(request) {
  if (!process.env.GROQ_API_KEY) {
    return fail(
      "Groq API key not configured. Add GROQ_API_KEY to .env.local and restart.",
      501,
      { code: "GROQ_NOT_CONFIGURED" }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Expected a JSON body: { docId, brief, market }");
  }

  const doc = getDoc(body?.docId);
  if (!doc) return fail(`Unknown document type "${body?.docId}".`);

  const brief = body.brief || {};
  if (!brief.service?.trim()) return fail("Tell us what you sell first.");
  if (!brief.author?.trim()) brief.author = "Owner";

  const niche = getNiche(brief.nicheId);
  const prompt = buildPrompt({ doc, brief, market: body.market, niche });

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
                content: `Produce the complete ${doc.name} now, following every section heading in order.`,
              },
            ],
            max_tokens: doc.tier === 2 ? 4000 : 2500,
            temperature: 0.6,
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
    doc: { id: doc.id, name: doc.name, audience: doc.audience, tier: doc.tier },
    model: usedModel,
    usage: payload.usage || null,
    finish_reason: payload.choices?.[0]?.finish_reason || null,
  });
}

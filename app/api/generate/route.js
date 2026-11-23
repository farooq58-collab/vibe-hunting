import { json, fail, fetchWithTimeout } from "@/lib/server/http";
import { getNiche, GOALS, CHANNELS, TONES } from "@/lib/niches";
import { nicheFor } from "@/lib/customNiche";
import { verifiedAngles } from "@/lib/score";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile"];

const CHANNEL_SPECS = {
  "Cold Call Script": `Write it as a phone script with these labelled sections:
- Opening line (5 seconds)
- Pain point hook (10 seconds)
- Value proposition (2 sentences)
- 2 objection handlers (write the likely objection, then the response)
- Closing CTA
- 30-second voicemail version`,
  "3-Touch Sequence": `Write a three-message follow-up sequence, each labelled and each usable on its own:
- Touch 1 — Day 0 (email): lead with the specific gap below. Include a subject line.
- Touch 2 — Day 3 (WhatsApp or SMS, under 50 words): a different angle, not a "just bumping this".
- Touch 3 — Day 7 (email): a short break-up message that leaves the door open. Include a subject line.
Never repeat the same sentence across touches.`,
  "Cold Email": `Put a subject line on the first line as "Subject: ...", then the body. Under 130 words.`,
  "WhatsApp Message": `Under 90 words, casual, one clear question at the end. No subject line.`,
  "LinkedIn DM": `Under 70 words, no links in the first message. No subject line.`,
};

function buildSystemPrompt({ business, niche, goal, channel, tone, gaps }) {
  return `You are an expert B2B outreach copywriter specializing in local service businesses.
You write highly personalized, conversion-focused outreach messages.

Business Details:
- Name: ${business.name}
- Niche: ${niche.label}
- Location: ${business.city || "Not specified"}
- Website: ${business.website || "Not found"}
- Phone: ${business.phone || "Not found"}
- Address: ${business.address || "Not found"}
- Instagram: ${business.instagram || "Not found"}

Niche Pain Point Context:
${niche.painPoint}

Verified Website Findings (we loaded their site and checked these ourselves —
this is the ONLY evidence you may treat as fact about their setup):
${
  gaps.length
    ? gaps.map((g) => `- ${g.label}: ${g.angle}`).join("\n")
    : "- Nothing verified. Their site was not audited, or it passed every check. Do NOT claim they are missing anything. Lead on the niche pain point below and ask a question instead of asserting a defect."
}

User Goal: ${goal}
Channel: ${channel}
Tone: ${tone}

Task:
Write a ${channel} outreach for this ${niche.label} business.
If there are verified findings above, open on the strongest one — be concrete,
because it is a real observation about this specific business. If there are
none, do NOT invent one: open on the niche pain point as a question.
Then give the value prop and one clear CTA.

Format for this channel:
${CHANNEL_SPECS[channel] || "Keep it short and direct."}

Rules:
- Keep it concise. No fluff. Sound like a human, not a robot.
- Never invent facts about the business that are not listed above. If they have no
  website, do not refer to "your site". If you were given no phone number, do not
  mention calling them.
- Do not claim to have visited, used, or been a customer of the business.
- Use plain text with short paragraphs. No markdown headers, no emoji spam.
- Output only the message itself — no commentary, no "here is your email".`;
}

export async function POST(request) {
  if (!process.env.GROQ_API_KEY) {
    return fail(
      "Groq API key not configured. Add GROQ_API_KEY to .env.local (free at console.groq.com) and restart the dev server.",
      501,
      { code: "GROQ_NOT_CONFIGURED" }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Expected a JSON body: { business, niche, goal, channel, tone }");
  }

  const { business, goal, channel, tone } = body || {};
  const niche = nicheFor(
    body?.niche || business?.niche_id,
    body?.term || business?.niche_term,
    getNiche
  );

  if (!business?.name) return fail("business.name is required.");
  if (!niche) return fail("A valid niche is required.");
  if (!GOALS.includes(goal)) return fail(`goal must be one of: ${GOALS.join(", ")}`);
  if (!CHANNELS.includes(channel)) return fail(`channel must be one of: ${CHANNELS.join(", ")}`);
  if (!TONES.includes(tone)) return fail(`tone must be one of: ${TONES.join(", ")}`);

  // Only signals we actually verified by loading their site. A missing
  // OpenStreetMap tag is NOT evidence of anything (91% of salons have no
  // `website` tag mapped), so it must never reach the prompt as a fact.
  const gaps = verifiedAngles(business);
  const systemPrompt = buildSystemPrompt({ business, niche, goal, channel, tone, gaps });
  const userPrompt = `Write the ${channel} now for "${business.name}"${
    business.city ? ` in ${business.city}` : ""
  }. Goal: ${goal}. Tone: ${tone}.`;

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
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens:
              channel === "Cold Call Script" || channel === "3-Touch Sequence" ? 1300 : 800,
            temperature: 0.7,
          }),
        },
        30000
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
    if (response?.status === 401) {
      return fail("Groq rejected the API key. Double-check GROQ_API_KEY.", 401);
    }
    if (response?.status === 429) {
      return fail("Groq rate limit reached. Wait a moment and retry.", 429);
    }
    return fail(`Groq responded with ${response?.status || 502}. ${lastErrorText.slice(0, 200)}`.trim(), 502);
  }

  const payload = await response.json();
  const message = payload.choices?.[0]?.message?.content?.trim();
  if (!message) return fail("Groq returned an empty response. Try regenerating.", 502);

  return json({
    message,
    model: usedModel,
    goal,
    channel,
    tone,
    niche: niche.label,
    gaps: gaps.map((gap) => gap.label),
    usage: payload.usage || null,
  });
}

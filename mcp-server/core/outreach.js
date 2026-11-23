/**
 * AI & Heuristic Outreach Pitch Generator
 * Generates high-converting Cold Emails, WhatsApp Messages, Cold Call Scripts, and Sequences.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function generateOutreachMessage({
  business_name,
  city = "",
  website = "",
  phone = "",
  niche = "Local Business",
  channel = "Cold Email",
  goal = "Book a 15-min discovery call",
  tone = "Direct",
  verified_gaps = [],
  pain_point = "",
}) {
  const gapsList = Array.isArray(verified_gaps) ? verified_gaps : [verified_gaps].filter(Boolean);
  const primaryGap = gapsList[0] || (website ? "No online instant booking system" : "Missing modern online web presence");
  const nicheContext = pain_point || "Customers call 2-3 local competitors and go with whoever responds and books first.";

  // If user configured GROQ_API_KEY, use the LLM model
  if (process.env.GROQ_API_KEY) {
    try {
      const systemPrompt = `You are an elite B2B sales copywriter specializing in local businesses.
Write an authentic, highly conversion-focused ${channel} for ${business_name} (${niche} in ${city || "local area"}).

Evidence & Context:
- Business: ${business_name}
- Website: ${website || "None"}
- Phone: ${phone || "None"}
- Key Finding / Defect: ${primaryGap}
- Niche Pressure: ${nicheContext}
- Goal: ${goal}
- Tone: ${tone}

Rules:
- Keep it concise, natural, and conversational.
- Lead with the specific observation without sounding accusatory.
- One clear call to action.
- Plain text only (no markdown headings).`;

      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate the ${channel} now.` },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return { channel, message: text, provider: "groq-ai" };
      }
    } catch {
      // Fallback to heuristic template below if Groq fails or times out
    }
  }

  // High-converting calibrated template engine (Zero-API Key, 100% Free)
  let pitch = "";
  const firstName = "Team";

  switch (channel) {
    case "WhatsApp Message":
      pitch = `Hi ${business_name} ${firstName}! 👋

Noticed your profile while looking up ${niche} services in ${city || "your area"}.

Quick observation: ${primaryGap}. When locals search on their phone, they often jump to whoever lets them book in 30 seconds.

I put together a quick 1-minute visual concept showing how you can capture these bookings automatically. Mind if I send the screenshot over here?`;
      break;

    case "Cold Call Script":
      pitch = `[OPENING - 5s]
"Hi, is this the owner or manager at ${business_name}? Hey, my name is [Your Name] — I know you're in the middle of a busy workday, so I'll keep this to 20 seconds."

[HOOK & OBSERVATION - 10s]
"I was researching top-rated ${niche} businesses around ${city || "the area"} and noticed ${primaryGap}. Most of your competitors are missing after-hours leads because of this exact setup."

[VALUE PROPOSITION]
"We built a simple plug-and-play booking system for local ${niche} that captures appointments 24/7 without you having to answer the phone while working."

[OBJECTION HANDLERS]
- If 'We get enough business through word of mouth': "That's awesome, and word-of-mouth is best. This simply ensures you don't lose the word-of-mouth clients who search you at 9 PM when the phones are off."
- If 'Send me an email': "Happy to! What's your direct email address? I'll send a 60-second video demo showing how it works."

[CLOSING CTA]
"Would you be open to taking a look at a 2-minute preview this Thursday afternoon?"`;
      break;

    case "LinkedIn DM":
      pitch = `Hey ${firstName}, came across ${business_name} while reviewing ${niche} providers in ${city || "the area"}.

Noticed a quick gap: ${primaryGap}. Built a fast fix that captures 15-20% more customer inquiries automatically.

Happy to share a quick 60-sec video breakdown if you're exploring growth this quarter. Let me know!`;
      break;

    case "3-Touch Sequence":
      pitch = `### Touch 1 — Day 0 (Email)
Subject: quick observation for ${business_name}

Hi ${firstName},

Was researching local ${niche} providers in ${city || "the region"} and came across ${business_name}.

Noticed a quick friction point: ${primaryGap}. In this trade, customers usually call the first 2 businesses and book with whoever responds immediately.

We helped a similar ${niche} business add an automated booking setup that recaptured missed weekend inquiries without extra admin work.

Open to seeing a 2-minute preview of what that looks like?

Best,
[Your Name]

---

### Touch 2 — Day 3 (WhatsApp / SMS)
Hey ${firstName}, sent a quick email earlier regarding ${business_name}'s online setup (${primaryGap}). Put together a 1-page breakdown showing how to capture 3-5 more bookings a week. Should I drop the link here?

---

### Touch 3 — Day 7 (Break-up Email)
Subject: closing the loop: ${business_name}

Hi ${firstName},

Haven't heard back, so I assume improving your online booking pipeline isn't a priority right now — totally understand!

If you ever want to fix ${primaryGap} and automate customer capture, feel free to reach back out.

Wishing you and ${business_name} continued success!`;
      break;

    case "Cold Email":
    default:
      pitch = `Subject: quick observation for ${business_name}

Hi ${firstName},

I was looking into local ${niche} services in ${city || "your area"} and came across ${business_name}.

I noticed one specific gap that might be costing you calls: ${primaryGap}. Right now, ${nicheContext}

We recently built a clean, automated booking and lead capture system specifically for ${niche} businesses that runs on autopilot.

Would you be open to a quick 10-minute chat this Thursday at 2 PM to see a preview?

Best regards,

[Your Name]
[Your Agency / Phone]`;
      break;
  }

  return {
    channel,
    message: pitch.trim(),
    provider: "calibrated-engine",
  };
}

/**
 * GTM document catalogue.
 *
 * Each entry is a real practitioner artifact with the section headings the
 * source frameworks actually use, adapted for a freelancer/small agency selling
 * to local service businesses. Sources are named per document so the output can
 * cite its own lineage rather than being generic AI filler.
 *
 * Metadata tiers follow standard business-document convention:
 *   Tier 0 (every document): title · date · owner · version · classification
 *   Tier 1 (client-facing):  + prepared for · prepared by · valid until · assumptions
 *   Tier 2 (long/formal):    + contents · executive summary · revision history
 */

export const GTM_DOCS = [
  {
    id: "gtm-strategy",
    name: "Go-To-Market Strategy",
    emoji: "🎯",
    audience: "Internal",
    tier: 2,
    length: "6–10 pages",
    blurb: "The master plan: who you sell to, what you say, through which channels, and the numbers.",
    lineage: "Smartsheet / Highspot / Asana GTM templates",
    sections: [
      "Executive Summary",
      "Business Objectives & Success Definition",
      "Market Definition & Sizing (bottom-up: businesses in radius × average first-year value)",
      "Target Segment & Vertical Selection (criteria: ticket value, repeat frequency, urgency, findability gap, retainer willingness, systematisability)",
      "Ideal Customer Profile — summary",
      "The Market Problem",
      "Our Offer / Service Packages",
      "Competitive Landscape (including the status quo and the owner's nephew)",
      "Positioning & Value Proposition",
      "Pricing Strategy",
      "GTM Motion & Channel Mix",
      "Sales Process & Stages",
      "Demand Generation Plan",
      "Partner & Referral Strategy",
      "Delivery Capacity Plan",
      "KPIs & Measurement",
      "Risks, Assumptions & Contingencies",
      "90-Day Milestones & Owners",
    ],
  },
  {
    id: "icp",
    name: "Ideal Customer Profile",
    emoji: "🔍",
    audience: "Internal",
    tier: 0,
    length: "2–4 pages",
    blurb: "Account-level fit definition that governs who you target and who you refuse.",
    lineage: "Cognism / Kalungi ICP frameworks",
    sections: [
      "ICP Summary Statement (one paragraph)",
      "Firmographics (trade, size in chairs/vans/rooms/members, locations, ownership: independent vs franchise, service area)",
      "Technographics (site platform, booking tool, POS/PMS, phone system, review profile)",
      "Observable Signals (what you can actually filter a list on)",
      "Pain Points & Business Challenges",
      "Jobs To Be Done",
      "Buying Triggers (new location, new licence, seasonal peak, bad review streak, hiring)",
      "Buying Process (decision maker, cycle length, typical budget)",
      "Value Fit — why they get outsized value from us",
      "Success Indicators — what a great client looks like 6 months in",
      "Negative ICP / Anti-ICP — explicit disqualifiers",
      "ICP Scoring Model (criteria, weights, tier thresholds)",
      "Evidence Base & Review Cadence",
    ],
  },
  {
    id: "persona",
    name: "Buyer Persona",
    emoji: "👤",
    audience: "Internal",
    tier: 0,
    length: "1 page",
    blurb: "The human inside the account — usually the owner-operator, between jobs, on a phone.",
    lineage: "Product Marketing Alliance B2B persona template",
    sections: [
      "Persona Snapshot (name + archetype, 2–3 sentences)",
      "Role & Day-to-Day Responsibilities",
      "Business Context",
      "Role in the Buying Decision & Budget Authority",
      "Goals & Motivations",
      "Challenges & Pain Points",
      "A Day in the Life",
      "Buying Triggers",
      "Decision Criteria",
      "Objections — why they will or won't buy (in their own words)",
      "Validators / Trust Signals",
      "Watering Holes (where they actually are — trade groups, supplier counters, Facebook groups; not LinkedIn)",
      "Communication Preferences (channel, timing, tone)",
      "Messaging Implications — what to say and what never to say",
    ],
  },
  {
    id: "positioning",
    name: "Positioning & Messaging House",
    emoji: "🏛️",
    audience: "Internal",
    tier: 0,
    length: "1–2 pages",
    blurb: "Dunford's worksheet worked first, then the Moore positioning sentence, then the message pillars.",
    lineage: "April Dunford, Obviously Awesome · Geoffrey Moore, Crossing the Chasm · PMA messaging framework",
    sections: [
      "1. Competitive Alternatives (what they'd do if you didn't exist — including nothing)",
      "2. Unique Attributes (what only you have)",
      "3. Value & Proof (what those attributes enable)",
      "4. Best-Fit Customer Characteristics",
      "5. Market Category (derived last, never first)",
      "Positioning Statement — Moore format: \"For [target] who [need], [name] is a [category] that [key benefit]. Unlike [alternative], we [differentiator].\"",
      "Messaging House — Roof: the core message (one sentence)",
      "Messaging House — Pillars: 3 themes, each with supporting message, proof points and the deliverable that earns it",
      "Messaging House — Foundation: proof point library",
      "Elevator Pitch (30 seconds)",
      "Tone of Voice — approved and banned terms",
      "Positioning we are NOT claiming",
    ],
  },
  {
    id: "value-prop-canvas",
    name: "Value Proposition Canvas",
    emoji: "🧩",
    audience: "Internal",
    tier: 0,
    length: "2 pages",
    blurb: "Customer jobs, pains and gains mapped one-to-one against your pain relievers and gain creators.",
    lineage: "Strategyzer (CC BY-SA 3.0 — attribution required)",
    sections: [
      "Customer Segment Definition",
      "Customer Jobs — functional, social and emotional (ranked by importance)",
      "Pains — ranked extreme to moderate, numbered P1, P2, P3…",
      "Gains — ranked essential to nice-to-have, numbered G1, G2, G3…",
      "Products & Services",
      "Pain Relievers — each mapped explicitly to a numbered pain (PR1 → P1)",
      "Gain Creators — each mapped explicitly to a numbered gain (GC1 → G1)",
      "Fit Analysis — where we fit, gaps we do not address, and waste",
      "Derived Value Proposition Statement",
      "Assumptions to Test",
    ],
  },
  {
    id: "battlecard",
    name: "Competitive Battlecard",
    emoji: "⚔️",
    audience: "Internal",
    tier: 0,
    length: "1 page",
    blurb: "One card per competitor CATEGORY: the nephew/DIY, lead-resale directories, offshore, and doing nothing.",
    lineage: "Klue / Crayon battlecard standards · Fact → Impact → Act",
    sections: [
      "Competitor Category & How To Spot It (the phrases owners actually use)",
      "What They Actually Deliver vs What We Deliver",
      "Their Genuine Strengths (be honest — then pivot)",
      "Why We Win (top 3, each tied to a customer consequence)",
      "Why We Lose",
      "Pricing Comparison & Traps",
      "Discovery Questions That Surface Their Gaps",
      "Landmines To Lay Early",
      "Objection Handling (objection in the prospect's words + two-sentence response)",
      "Counter-FUD",
      "When To Engage / When To Walk Away",
    ],
  },
  {
    id: "sales-playbook",
    name: "Sales Playbook",
    emoji: "📕",
    audience: "Internal",
    tier: 2,
    length: "6–12 pages",
    blurb: "How you actually sell: stages, qualification, scripts, objections, pricing guardrails.",
    lineage: "HubSpot sales playbook · Winning by Design SPICED",
    sections: [
      "Offer & Package Overview",
      "ICP & Anti-ICP (summary)",
      "Sales Process Stages with entry/exit criteria (Audit → Proposal → Close)",
      "Qualification Framework — CHAMP (Challenges, Authority, Money, Prioritisation) with the exact questions to ask",
      "SPICED discovery for retainer deals (Situation, Pain, Impact, Critical event, Decision)",
      "The Free Audit Play — trigger, steps, asset, success criterion",
      "Scripts: cold opener, voicemail, discovery call, audit walkthrough, close",
      "Objection Handling Library",
      "Pricing, Discounting & Concession Ladder",
      "Follow-up SLAs & CRM Hygiene",
      "Delivery Capacity Planning (builds per month)",
      "Playbook KPIs",
    ],
  },
  {
    id: "cadence",
    name: "Outreach Cadence Plan",
    emoji: "📇",
    audience: "Internal",
    tier: 0,
    length: "2–3 pages",
    blurb: "A multi-touch, multi-channel sequence with a full touch table — phone-led, not LinkedIn-led.",
    lineage: "Outreach.io / Salesloft cadence standards, adapted: local owners answer phones",
    sections: [
      "Cadence Overview (name, segment, trigger, personalisation tier, goal)",
      "Entry Criteria & Daily Volume",
      "Channel Mix with rationale (phone and walk-in dominate; LinkedIn is near-useless for this buyer)",
      "TOUCH TABLE — a markdown table with columns: Step | Day | Channel | Auto/Manual | Angle | Goal | Asset",
      "Message Library — full copy for every step",
      "Timing Rules (trade rhythms: avoid 7–9am for trades, avoid Saturdays for salons)",
      "Branching Logic (if opened / if no reply / if gatekeeper)",
      "Exit Criteria",
      "Target Metrics per step with the benchmark ranges stated as ranges",
      "Compliance & Deliverability (opt-out, sending limits, do-not-contact list)",
    ],
    guidance:
      "Use 7–9 touches over 14–18 days — local owners decide fast or not at all. Spacing widens: 1–2 days early, 3–7 days later. Emails 50–125 words.",
  },
  {
    id: "launch-plan",
    name: "30-60-90 Day Launch Plan",
    emoji: "🚀",
    audience: "Internal",
    tier: 0,
    length: "1–3 pages",
    blurb: "What you do in the first 30, 60 and 90 days, with the same field structure per block.",
    lineage: "Standard 30-60-90 structure + product-launch tiering",
    sections: [
      "Launch Overview (offer, owner, target date)",
      "Days 1–30 — Focus | Goals | Key Activities | Metrics of Success",
      "Days 31–60 — Focus | Goals | Key Activities | Metrics of Success",
      "Days 61–90 — Focus | Goals | Key Activities | Metrics of Success",
      "Pilot-Client Gate (2–3 friendly local businesses at a discount, for testimonials)",
      "Weekly Activity Targets (calls, audits sent, proposals)",
      "Definition of Success at Day 90",
      "Risks & Contingencies",
    ],
  },
  {
    id: "pricing",
    name: "Pricing & Packaging One-Pager",
    emoji: "💷",
    audience: "Client-facing",
    tier: 1,
    length: "1 page",
    blurb: "Three tiers, what's included, what it costs, and what it's worth to them.",
    lineage: "Standard good/better/best packaging",
    sections: [
      "The Outcome You're Buying (one sentence, in the client's language)",
      "Package Comparison Table — three tiers with inclusions, price and turnaround",
      "What's Not Included",
      "Payment Terms & Deposit",
      "ROI Framing — what one extra booked job per month is worth against the fee",
      "Guarantee / Risk Reversal",
      "Next Step",
    ],
  },
  {
    id: "case-study",
    name: "Case Study",
    emoji: "📈",
    audience: "Client-facing",
    tier: 1,
    length: "1–2 pages",
    blurb: "Challenge → Solution → Result. The single highest-leverage asset for a local seller.",
    lineage: "Standard Challenge-Solution-Result structure",
    sections: [
      "Client Snapshot (trade, size, location)",
      "The Challenge — the situation before, in concrete operational terms",
      "The Solution — what was built and why, in that order",
      "Implementation — how long it took and what the client had to do",
      "The Results — quantified: calls answered, bookings, no-shows, hours saved",
      "Client Quote",
      "What We'd Do Next",
    ],
    guidance:
      "Results must be jobs, calls and bookings — never impressions or rankings. If a metric is illustrative rather than measured, label it clearly as an example.",
  },
  {
    id: "capability",
    name: "Capability One-Pager",
    emoji: "📄",
    audience: "Client-facing",
    tier: 1,
    length: "1 page",
    blurb: "The leave-behind: who you are, what you do, proof, and how to start.",
    lineage: "Standard capability statement / leave-behind",
    sections: [
      "Who We Are (two sentences)",
      "Who We Work With",
      "What We Do — three service lines, outcome-first",
      "Why Us — differentiators with proof",
      "Selected Results",
      "How Engagements Work — the steps and the timeline",
      "Pricing From",
      "Contact & Next Step",
    ],
  },
];

export const getDoc = (id) => GTM_DOCS.find((d) => d.id === id) || null;

/**
 * Bottom-up market sizing, computed in code rather than by the model.
 *
 * Language models do arithmetic badly — asked to size a market it produced
 * "180,000 + 12 × 35,000 = 290,000" (it is 600,000). A formal document with
 * wrong money in it is worse than no document, so every figure is calculated
 * here and handed to the model as a fact it is forbidden to recompute.
 *
 * Bottom-up (count × value) is also the only sizing method that is defensible
 * at local scale — top-down industry percentages are unfalsifiable hand-waving.
 */
export function computeSizing(market, brief) {
  const oneOff = Number(brief?.oneOff) || 0;
  const monthly = Number(brief?.monthly) || 0;
  if (!market?.total || (!oneOff && !monthly)) return null;

  const currency = brief.currency || "$";
  const money = (n) => `${currency}${Math.round(n).toLocaleString("en-US")}`;

  const firstYearValue = oneOff + monthly * 12;
  const sam = market.total * firstYearValue;

  // Deliberately conservative and stated as a scenario, not a forecast.
  const scenarios = [0.01, 0.02, 0.05].map((rate) => ({
    rate,
    clients: Math.max(1, Math.round(market.total * rate)),
    revenue: Math.round(market.total * rate) * firstYearValue,
  }));

  return {
    firstYearValue,
    sam,
    scenarios,
    lines: [
      `- Average first-year value per client: ${money(firstYearValue)} (${money(oneOff)} build + 12 × ${money(monthly)} retainer)`,
      `- Serviceable market (SAM), bottom-up: ${market.total} mapped businesses × ${money(firstYearValue)} = ${money(sam)}`,
      ...scenarios.map(
        (s) =>
          `- At ${(s.rate * 100).toFixed(0)}% capture: ${s.clients} client${s.clients === 1 ? "" : "s"} = ${money(s.revenue)} first-year revenue`
      ),
      `- Monthly recurring at ${scenarios[1].clients} clients: ${money(scenarios[1].clients * monthly)}/mo`,
    ],
  };
}

export const CLASSIFICATIONS = {
  Internal: "Internal — not for distribution",
  "Client-facing": "Confidential",
};

/**
 * Client-facing GTM documents — generated ABOUT a lead, to be sold TO that lead.
 *
 * The perspective flips from the rest of the app. Everywhere else the subject is
 * the LeadForge user (a freelancer selling websites and automation). Here the
 * subject is the local business they found, and the audience is that business's
 * own customers: the homeowner with a burst pipe, the bride booking a blow-dry.
 *
 * ── The integrity rule ────────────────────────────────────────────────────
 * These documents get delivered to a real, named business, usually for money.
 * We know very little about them — a name, a trade, an address, and whatever
 * the site audit actually verified. Everything else is unknown.
 *
 * So generation is bound by the same three-state discipline as the rating: a
 * fact is either verified, or it is marked [TO CONFIRM] and carried into an
 * explicit assumptions register. A sold document that invents a revenue figure,
 * a staff count or a review score is worse than no document — it is the fastest
 * way for a freelancer to lose a client and their reputation.
 */

export const CLIENT_DOCS = [
  {
    id: "marketing-audit",
    name: "Local Marketing Audit",
    emoji: "🔬",
    sellable: true,
    length: "3–5 pages",
    blurb:
      "What we verified about their online setup, what it is costing them, and what to fix first. The door-opener.",
    needsAudit: true,
    sections: [
      "Scope & Method (what was checked, what was not, and the date)",
      "Verified Findings — a table of each check, its result, and the evidence",
      "What Each Finding Costs Them (in enquiries and bookings, framed as ranges)",
      "Not Assessed — what would need access or a conversation to evaluate",
      "Priority Fixes — ranked by impact against effort",
      "Quick Wins (this week)",
      "Recommended Next Step",
    ],
  },
  {
    id: "growth-plan",
    name: "90-Day Local Growth Plan",
    emoji: "📈",
    sellable: true,
    length: "4–6 pages",
    blurb: "Their go-to-market: who they serve, how customers find them, and the 90-day plan.",
    sections: [
      "Executive Summary",
      "Where They Are Now (verified observations only)",
      "Who Their Best Customers Are",
      "How Customers Currently Find Them",
      "The Growth Levers — ranked",
      "Days 1–30 — Focus | Actions | Owner | Measure",
      "Days 31–60 — Focus | Actions | Owner | Measure",
      "Days 61–90 — Focus | Actions | Owner | Measure",
      "What Success Looks Like at Day 90",
      "Assumptions to Confirm",
    ],
  },
  {
    id: "customer-persona",
    name: "Their Customer Persona",
    emoji: "🧍",
    sellable: true,
    length: "1–2 pages",
    blurb: "The end customer — the person booking the appointment, not the business owner.",
    sections: [
      "Persona Snapshot (name + archetype)",
      "Situation That Triggers The Need",
      "What They Are Actually Trying To Get Done",
      "How They Search & Decide",
      "What Makes Them Choose One Provider Over Another",
      "Objections & Hesitations",
      "Where They Look (search, maps, social, word of mouth)",
      "What Would Make Them Book Immediately",
      "Messaging Implications",
    ],
  },
  {
    id: "value-canvas",
    name: "Customer Value Canvas",
    emoji: "🧩",
    sellable: true,
    length: "2 pages",
    blurb: "Their customers' jobs, pains and gains mapped against what the business offers.",
    sections: [
      "Customer Segment",
      "Customer Jobs — functional, social, emotional",
      "Pains — numbered P1, P2, P3…",
      "Gains — numbered G1, G2, G3…",
      "Their Services",
      "Pain Relievers — each mapped to a numbered pain",
      "Gain Creators — each mapped to a numbered gain",
      "Where The Fit Is Strong",
      "Where The Fit Is Missing (the opportunity)",
      "Attribution: Value Proposition Canvas © Strategyzer AG, CC BY-SA 3.0",
    ],
  },
  {
    id: "local-seo",
    name: "Local Visibility Plan",
    emoji: "📍",
    sellable: true,
    length: "2–3 pages",
    blurb: "Google Business Profile, map pack, and local search — the highest-leverage channel.",
    sections: [
      "Why Local Search Decides This Market",
      "Google Business Profile — Checklist of what must be complete",
      "Categories, Services & Service Area",
      "Photos & Posts Cadence",
      "Local Keywords They Should Rank For",
      "Citations & Directory Consistency (NAP)",
      "On-Site Essentials",
      "Measurement — what to check monthly",
      "Assumptions to Confirm",
    ],
  },
  {
    id: "reviews",
    name: "Review & Reputation Playbook",
    emoji: "⭐",
    sellable: true,
    length: "2 pages",
    blurb: "How to ask, when to ask, and how to answer — the cheapest growth lever they have.",
    sections: [
      "Why Reviews Convert In This Trade",
      "The Ask — exact wording, and the right moment to send it",
      "Request Cadence & Channel (SMS vs email vs in-person)",
      "Responding to Positive Reviews",
      "Responding to Negative Reviews — a template and the rules",
      "What Never To Do (incentives, gating, fake reviews — and why)",
      "Monthly Targets & Tracking",
    ],
  },
  {
    id: "booking-system",
    name: "Bookings & Retention Blueprint",
    emoji: "📅",
    sellable: true,
    length: "2–3 pages",
    blurb: "Capture the enquiry, cut no-shows, and get the second visit booked.",
    sections: [
      "Where Enquiries Are Being Lost Today (verified observations only)",
      "Enquiry Capture — the routes a customer should have",
      "Missed-Call Recovery",
      "Booking Confirmation & Reminder Sequence (timings and copy)",
      "No-Show Reduction Tactics",
      "Rebooking & Repeat-Visit Prompts",
      "Reactivation of Lapsed Customers",
      "What To Measure",
    ],
  },
  {
    id: "campaign-calendar",
    name: "Seasonal Campaign Calendar",
    emoji: "🗓️",
    sellable: true,
    length: "2 pages",
    blurb: "A twelve-month promotional plan built around this trade's real peaks and troughs.",
    sections: [
      "This Trade's Demand Pattern Through The Year",
      "Quarter-by-Quarter Campaign Table — Month | Theme | Offer | Channel | Asset Needed",
      "Filling The Known Quiet Periods",
      "Always-On Activity",
      "Effort vs Return — what to drop if time is short",
      "Assumptions to Confirm",
    ],
  },
  {
    id: "competitor-snapshot",
    name: "Local Competitor Snapshot",
    emoji: "🔭",
    sellable: true,
    length: "1–2 pages",
    blurb: "How they stack up locally and where the gap is — framed carefully, since rival data is limited.",
    sections: [
      "Method & Limitations (state plainly what was and was not checked)",
      "The Local Competitive Set",
      "How Customers Compare Providers In This Trade",
      "Where This Business Is Likely Strong",
      "Where This Business Is Likely Exposed",
      "The Differentiation Opportunity",
      "What To Verify Before Acting",
    ],
  },
  {
    id: "proposal",
    name: "Proposal & Scope of Work",
    emoji: "📝",
    sellable: false,
    length: "2–3 pages",
    blurb: "The document that sells the work: scope, deliverables, timeline, price, next step.",
    sections: [
      "Prepared For / Prepared By",
      "What We Observed (verified findings only — the reason for this proposal)",
      "Recommended Scope of Work",
      "Deliverables — itemised",
      "Timeline & Milestones",
      "What We Need From You",
      "Investment (use the pre-computed pricing verbatim)",
      "What Is Not Included",
      "Terms & Validity",
      "Next Step",
    ],
  },
];

export const getClientDoc = (id) => CLIENT_DOCS.find((d) => d.id === id) || null;

/**
 * Everything we can honestly say about a lead, split into verified facts and
 * declared unknowns. The unknowns list is passed to the model deliberately: it
 * is what stops the document inventing them.
 */
export function leadFactSheet(lead, audit) {
  const known = [
    `- Business name: ${lead.name}`,
    `- Trade: ${lead.niche || "not recorded"}`,
    `- Town/city: ${lead.city || "not recorded"}`,
    lead.address ? `- Address: ${lead.address}` : null,
    lead.phone ? `- Published phone: ${lead.phone}` : null,
    lead.website ? `- Website: ${lead.website}` : null,
    lead.email ? `- Published email: ${lead.email}` : null,
    lead.instagram ? `- Instagram: ${lead.instagram}` : null,
    lead.facebook ? `- Facebook: ${lead.facebook}` : null,
    lead.opening_hours ? `- Opening hours: ${lead.opening_hours}` : null,
  ].filter(Boolean);

  const verified = [];
  const unknown = [];

  if (audit) {
    const checks = [
      ["Mobile-friendly (viewport set)", audit.not_mobile_friendly, true],
      ["Booking or enquiry form present", audit.no_booking_form, true],
      ["Content up to date", audit.stale_content, true],
      ["Served over HTTPS", audit.no_ssl, true],
    ];
    for (const [label, state, inverted] of checks) {
      if (state !== "present" && state !== "absent") continue;
      // Each audit key records a DEFECT, so "present" means the check failed.
      const passed = inverted ? state === "absent" : state === "present";
      verified.push(`- ${label}: ${passed ? "YES — this is fine" : "NO — verified problem"}`);
    }
    if (audit.copyright_year) {
      verified.push(`- Copyright year shown on their site: ${audit.copyright_year}`);
    }
  } else {
    unknown.push(
      lead.website
        ? "- Their website has NOT been audited. Make no claim about its quality, speed, mobile layout or booking setup."
        : "- No website is recorded for them on OpenStreetMap. This is NOT evidence they lack one — the tag is simply missing (only ~9-15% of mapped businesses carry it). Do not state or imply that they have no website."
    );
  }

  unknown.push(
    "- Revenue, pricing, staff count, number of chairs/vans/rooms: UNKNOWN",
    "- Review count and star rating: UNKNOWN",
    "- Current marketing spend, agencies or tools in use: UNKNOWN",
    "- Google Business Profile status: UNKNOWN",
    "- Their busiest and quietest periods: UNKNOWN (infer from the trade generally, and label it as a general pattern)"
  );

  return { known, verified, unknown };
}

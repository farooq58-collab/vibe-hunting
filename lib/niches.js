/**
 * Single source of truth for every niche LeadForge supports.
 *
 * `osmTags` are raw OpenStreetMap tag filters. Each entry becomes one
 * node/way/relation triple inside the Overpass union query, so a niche with two
 * tags produces six statements. See lib/overpass.js.
 *
 * `painPoint` is injected verbatim into the Groq system prompt so the generated
 * outreach is niche-specific instead of generic AI filler.
 */
/**
 * `fitValue` (0-100) grades how well a trade suits an agency selling websites,
 * booking systems and automation: high-ticket, appointment-driven, owner-decided
 * businesses score highest; low-ticket walk-in trades score lowest. It is the
 * only fit signal that discriminates ACROSS niches (within a single search every
 * lead shares it), so it matters most when comparing saved leads in the CRM.
 */
export const NICHES = [
  {
    id: "plumbers",
    label: "Plumbers",
    emoji: "🔧",
    fitValue: 60,
    fitRationale: "emergency dispatch, high ticket, but bookings are phone-led",
    osmTags: ['"craft"="plumber"', '"shop"="plumber"', '"trade"="plumber"'],
    painPoint:
      "Most plumbers lose leads because they never follow up. No online booking system. Customers call 3 plumbers and go with whoever responds first.",
  },
  {
    id: "laundry",
    label: "Laundry Services",
    emoji: "🧺",
    fitValue: 30,
    fitRationale: "low ticket and walk-in led, so digital spend is harder to justify",
    osmTags: ['"shop"="laundry"', '"shop"="dry_cleaning"'],
    painPoint:
      "Customers forget to come back. No loyalty program or WhatsApp ordering. They lose repeat business to competitors who send reminders.",
  },
  {
    id: "gyms",
    label: "Gym Coaches",
    emoji: "🏋️",
    fitValue: 100,
    fitRationale: "recurring memberships and class booking — high lifetime value per client",
    osmTags: ['"leisure"="fitness_centre"', '"sport"="fitness"', '"sport"="gym"'],
    painPoint:
      "Clients drop off after 3 months. No automated check-ins or upsell funnel. Coaches spend time chasing payments instead of training.",
  },
  {
    id: "electricians",
    label: "Electricians",
    emoji: "⚡",
    fitValue: 60,
    fitRationale: "emergency dispatch and high ticket, but phone-led rather than booked online",
    osmTags: ['"craft"="electrician"', '"shop"="electrical"'],
    painPoint:
      "Miss emergency night calls. No 24/7 booking page. Lose jobs to whoever has a website that ranks on Google.",
  },
  {
    id: "dentists",
    label: "Dentists",
    emoji: "🦷",
    fitValue: 100,
    fitRationale: "appointment-driven, high treatment value, owner-operator decides",
    osmTags: ['"amenity"="dentist"', '"healthcare"="dentist"'],
    painPoint:
      "Patients miss appointments. No automated reminders. 30% of chairs sit empty on weekdays.",
  },
  {
    id: "salons",
    label: "Salons",
    emoji: "💇",
    fitValue: 100,
    fitRationale: "appointment-driven with repeat visits — online booking pays for itself",
    osmTags: ['"shop"="hairdresser"', '"shop"="beauty"'],
    painPoint:
      "Empty slots on Tuesdays and Wednesdays. Instagram DMs go unanswered for hours. No automated booking — customers go to whoever responds first.",
  },
];

export const getNiche = (id) => NICHES.find((n) => n.id === id) || null;

/** Sentinel for the free-text trade box — see lib/customNiche.js. */
export const OTHER_NICHE = { id: "other", label: "Other — type your own", emoji: "✏️" };

export const GOALS = [
  "Get a Meeting",
  "Offer Free Audit",
  "Pitch a Service",
  "Follow Up",
];

export const CHANNELS = [
  "Cold Email",
  "WhatsApp Message",
  "Cold Call Script",
  "LinkedIn DM",
  "3-Touch Sequence",
];

export const TONES = ["Professional", "Friendly", "Direct", "Urgent"];

export const STATUSES = [
  "New",
  "Contacted",
  "Follow Up",
  "Closed",
  "Not Interested",
];

export const STATUS_STYLES = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-sky-50 text-sky-700 border-sky-200",
  "Follow Up": "bg-amber-50 text-amber-800 border-amber-200",
  Closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Not Interested": "bg-neutral-100 text-neutral-500 border-neutral-200",
};

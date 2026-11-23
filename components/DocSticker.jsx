"use client";

/**
 * Custom handcrafted stickers / iconography for GTM and Client deliverables.
 * Replaces generic AI emojis with human-designed, premium vector badges.
 */

export default function DocSticker({ id, className = "" }) {
  const sticker = STICKERS[id] || DEFAULT_STICKER;
  const IconComponent = sticker.Icon;

  return (
    <div
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-2xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-xs ${sticker.bg} ${sticker.border} ${sticker.text} ${className}`}
      aria-label={sticker.name}
    >
      <IconComponent className="h-5 w-5" />
    </div>
  );
}

// 1. Go-To-Market Strategy: Precision Target & Crosshairs
function IconGtmStrategy({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" strokeOpacity={0.3} strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <path strokeLinecap="round" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
    </svg>
  );
}

// 2. Ideal Customer Profile: Precision Focus Aperture with Persona Node
function IconIcp({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M16 16l4.5 4.5" />
      <circle cx="11" cy="9.5" r="2" />
      <path strokeLinecap="round" d="M7.5 14.5c.8-1.5 2.1-2 3.5-2s2.7.5 3.5 2" />
    </svg>
  );
}

// 3. Buyer Persona: Identity Profile Card & Silhouette
function IconPersona({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="10" r="3" />
      <path strokeLinecap="round" d="M7 17.5c1.2-2 3.2-2.5 5-2.5s3.8.5 5 2.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

// 4. Positioning & Messaging House: Architecture Pillar / Foundation
function IconPositioning({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5" />
      <path strokeLinecap="round" d="M5 9.5v9m4-9v9m6-9v9m4-9v9M3 21h18" />
    </svg>
  );
}

// 5. Value Proposition Canvas: Geometric Value Matrix & Interlocking Blocks
function IconValueCanvas({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" fillOpacity={0.15} />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" fillOpacity={0.15} />
      <path strokeLinecap="round" d="M7 7h.01M17 17h.01" strokeWidth={2.5} />
    </svg>
  );
}

// 6. Competitive Battlecard: Crossed Strategic Fencing Blades / Crest
function IconBattlecard({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 5l-7 7m0 0l-3-3m3 3l-6 6M5 19l4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l7 7m0 0l3-3m-3 3l6 6m-2 2l-4-4" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 7. Sales Playbook: Strategic Playbook Manual with Bookmark
function IconPlaybook({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5z" />
      <path strokeLinecap="round" d="M6.5 2H4a2 2 0 00-2 2v15a2 2 0 002 2h2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v7l2.5-1.5L17 9V2" fill="currentColor" fillOpacity={0.2} />
    </svg>
  );
}

// 8. Outreach Cadence Plan: Multi-Touch Rhythm & Touchpoint Sequence
function IconCadence({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path strokeLinecap="round" d="M3 9h18M8 2v3m8-3v3" />
      <circle cx="8" cy="14" r="1.5" fill="currentColor" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" />
      <circle cx="16" cy="14" r="1.5" fill="currentColor" />
      <path strokeLinecap="round" d="M9.5 14h1m3 0h1" />
    </svg>
  );
}

// 9. 30-60-90 Day Launch Plan: Orbital Launch & Ascending Vector
function IconLaunch({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 4.5l5 5m-5-5c-3.5 3.5-3 8-3 8l-4 4-2-2 4-4s-4.5.5-8-3l5-5c2.5-2.5 5-2 8-3-1 3-.5 5.5-3 8z" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
      <path strokeLinecap="round" d="M4.5 19.5c1-1 2-1 3 0" />
    </svg>
  );
}

// 10. Pricing & Packaging: Tiered Diamond Price Tag
function IconPricing({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 8-8 12L4 10l8-8z" />
      <circle cx="12" cy="9" r="2" fill="currentColor" />
      <path strokeLinecap="round" d="M10 14h4m-3 3h2" />
    </svg>
  );
}

// 11. Case Study: Metric Growth Trajectory & Proof Chart
function IconCaseStudy({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l3.5-4 3 2.5 4-5.5" />
      <circle cx="17.5" cy="9" r="1.5" fill="currentColor" />
      <path strokeLinecap="round" d="M7 17h10" />
    </svg>
  );
}

// 12. Capability One-Pager: Executive Dossier & Verified Seal
function IconCapability({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
      <path strokeLinecap="round" d="M9 13h6m-6 4h4" />
    </svg>
  );
}

// Additional Client Deliverable Icons
function IconAudit({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4" />
    </svg>
  );
}

function IconSeo({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="10" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z" />
    </svg>
  );
}

function IconReviews({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function IconBooking({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path strokeLinecap="round" d="M16 2v4M8 2v4M3 9h18" />
      <circle cx="12" cy="14" r="3" />
      <path strokeLinecap="round" d="M12 13v1.5l1 .5" />
    </svg>
  );
}

function IconProposal({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h4m5-14H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V6l-4-4z" />
      <path strokeLinecap="round" d="M14 2v4h4" />
      <circle cx="16" cy="16" r="3" fill="currentColor" fillOpacity={0.2} />
    </svg>
  );
}

// Registry mapping document ID to sticker styling and icon
const STICKERS = {
  // GTM Documents
  "gtm-strategy": {
    name: "Go-To-Market Strategy",
    Icon: IconGtmStrategy,
    bg: "bg-gradient-to-br from-blue-50 to-indigo-100/70",
    border: "border-blue-200/90",
    text: "text-blue-600",
  },
  "icp": {
    name: "Ideal Customer Profile",
    Icon: IconIcp,
    bg: "bg-gradient-to-br from-sky-50 to-cyan-100/70",
    border: "border-sky-200/90",
    text: "text-sky-600",
  },
  "persona": {
    name: "Buyer Persona",
    Icon: IconPersona,
    bg: "bg-gradient-to-br from-emerald-50 to-teal-100/70",
    border: "border-emerald-200/90",
    text: "text-emerald-600",
  },
  "positioning": {
    name: "Positioning & Messaging House",
    Icon: IconPositioning,
    bg: "bg-gradient-to-br from-amber-50 to-orange-100/70",
    border: "border-amber-200/90",
    text: "text-amber-600",
  },
  "value-prop-canvas": {
    name: "Value Proposition Canvas",
    Icon: IconValueCanvas,
    bg: "bg-gradient-to-br from-indigo-50 to-purple-100/70",
    border: "border-indigo-200/90",
    text: "text-indigo-600",
  },
  "battlecard": {
    name: "Competitive Battlecard",
    Icon: IconBattlecard,
    bg: "bg-gradient-to-br from-rose-50 to-red-100/70",
    border: "border-rose-200/90",
    text: "text-rose-600",
  },
  "sales-playbook": {
    name: "Sales Playbook",
    Icon: IconPlaybook,
    bg: "bg-gradient-to-br from-fuchsia-50 to-pink-100/70",
    border: "border-fuchsia-200/90",
    text: "text-fuchsia-600",
  },
  "cadence": {
    name: "Outreach Cadence Plan",
    Icon: IconCadence,
    bg: "bg-gradient-to-br from-purple-50 to-violet-100/70",
    border: "border-purple-200/90",
    text: "text-purple-600",
  },
  "launch-plan": {
    name: "30-60-90 Day Launch Plan",
    Icon: IconLaunch,
    bg: "bg-gradient-to-br from-sky-50 to-blue-100/70",
    border: "border-sky-200/90",
    text: "text-blue-600",
  },
  "pricing": {
    name: "Pricing & Packaging One-Pager",
    Icon: IconPricing,
    bg: "bg-gradient-to-br from-teal-50 to-emerald-100/70",
    border: "border-teal-200/90",
    text: "text-teal-600",
  },
  "case-study": {
    name: "Case Study",
    Icon: IconCaseStudy,
    bg: "bg-gradient-to-br from-blue-50 to-sky-100/70",
    border: "border-blue-200/90",
    text: "text-blue-600",
  },
  "capability": {
    name: "Capability One-Pager",
    Icon: IconCapability,
    bg: "bg-gradient-to-br from-slate-100 to-neutral-200/70",
    border: "border-slate-300/90",
    text: "text-slate-700",
  },

  // Client Documents
  "marketing-audit": {
    name: "Local Marketing Audit",
    Icon: IconAudit,
    bg: "bg-gradient-to-br from-indigo-50 to-blue-100/70",
    border: "border-indigo-200/90",
    text: "text-indigo-600",
  },
  "growth-plan": {
    name: "90-Day Local Growth Plan",
    Icon: IconCaseStudy,
    bg: "bg-gradient-to-br from-emerald-50 to-teal-100/70",
    border: "border-emerald-200/90",
    text: "text-emerald-600",
  },
  "customer-persona": {
    name: "Their Customer Persona",
    Icon: IconPersona,
    bg: "bg-gradient-to-br from-sky-50 to-cyan-100/70",
    border: "border-sky-200/90",
    text: "text-sky-600",
  },
  "value-canvas": {
    name: "Customer Value Canvas",
    Icon: IconValueCanvas,
    bg: "bg-gradient-to-br from-purple-50 to-indigo-100/70",
    border: "border-purple-200/90",
    text: "text-purple-600",
  },
  "local-seo": {
    name: "Local SEO & Visibility Plan",
    Icon: IconSeo,
    bg: "bg-gradient-to-br from-orange-50 to-amber-100/70",
    border: "border-orange-200/90",
    text: "text-orange-600",
  },
  "reviews": {
    name: "Review & Reputation Playbook",
    Icon: IconReviews,
    bg: "bg-gradient-to-br from-amber-50 to-yellow-100/70",
    border: "border-amber-200/90",
    text: "text-amber-600",
  },
  "booking-system": {
    name: "Online Booking & Conversion Blueprint",
    Icon: IconBooking,
    bg: "bg-gradient-to-br from-teal-50 to-cyan-100/70",
    border: "border-teal-200/90",
    text: "text-teal-600",
  },
  "campaign-calendar": {
    name: "Quarterly Campaign Calendar",
    Icon: IconCadence,
    bg: "bg-gradient-to-br from-purple-50 to-pink-100/70",
    border: "border-purple-200/90",
    text: "text-purple-600",
  },
  "competitor-snapshot": {
    name: "Local Competitor Snapshot",
    Icon: IconBattlecard,
    bg: "bg-gradient-to-br from-rose-50 to-red-100/70",
    border: "border-rose-200/90",
    text: "text-rose-600",
  },
  "proposal": {
    name: "Service & Pricing Proposal",
    Icon: IconProposal,
    bg: "bg-gradient-to-br from-blue-50 to-indigo-100/70",
    border: "border-blue-200/90",
    text: "text-blue-600",
  },
};

const DEFAULT_STICKER = {
  name: "Document",
  Icon: IconCapability,
  bg: "bg-gradient-to-br from-neutral-50 to-neutral-100",
  border: "border-neutral-200",
  text: "text-neutral-700",
};

/**
 * Handcrafted vector stickers for the 6 Core Engineering Modules in app/page.jsx
 */
export function ModuleSticker({ module, className = "" }) {
  const mKey = String(module).padStart(2, "0");
  const sticker = MODULE_STICKERS[mKey] || MODULE_STICKERS["01"];
  const IconComponent = sticker.Icon;

  return (
    <div
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-2xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-xs mb-4 ${sticker.bg} ${sticker.border} ${sticker.text} ${className}`}
      aria-label={sticker.name}
    >
      <IconComponent className="h-5 w-5" />
    </div>
  );
}

// Module 01: Global Geocoding & Open Data POI Grid
function IconModuleGeocoding({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M3.6 9h16.8M3.6 15h16.8" />
      <path strokeLinecap="round" d="M12 3a14 14 0 000 18M12 3a14 14 0 010 18" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

// Module 02: 0-100 Opportunity Rating & Fit Engine
function IconModuleScoring({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" d="M3.5 17.5A9 9 0 1120.5 17.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l4-4" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <path strokeLinecap="round" d="M7 17l1-1M17 17l-1-1M12 5v2" />
    </svg>
  );
}

// Module 03: Conversion Crawler & Code Defect Audit
function IconModuleAudit({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="15" rx="3" />
      <path strokeLinecap="round" d="M3 8h18" />
      <circle cx="6" cy="5.5" r="1" fill="currentColor" />
      <circle cx="9" cy="5.5" r="1" fill="currentColor" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 13l2-2-2-2m4 4l-2-2 2-2" />
      <path strokeLinecap="round" d="M8 21h8m-4-3v3" />
    </svg>
  );
}

// Module 04: AI Multi-Touch Outreach (Omni-Channel Broadcast)
function IconModuleOutreach({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 2l-7 20-4-9-9-4 20-7z" fill="currentColor" fillOpacity={0.15} />
      <circle cx="5" cy="5" r="1.5" fill="currentColor" />
      <circle cx="19" cy="19" r="1.5" fill="currentColor" />
      <path strokeLinecap="round" d="M18 10a5 5 0 01-5 5" strokeDasharray="2 2" />
    </svg>
  );
}

// Module 05: GTM Strategy & Blueprint Studio
function IconModuleGtm({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" strokeDasharray="3 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16M9 4v16" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity={0.2} />
      <path strokeLinecap="round" d="M4 4l4 4" />
    </svg>
  );
}

// Module 06: @vibe-hunter MCP Terminal Node
function IconModuleMcp({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="13" rx="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8.5l3 2.5-3 2.5m5 0h4" />
      <path strokeLinecap="round" d="M8 20h8m-4-3v3" />
      <circle cx="18" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

const MODULE_STICKERS = {
  "01": {
    name: "Global Geocoding & Open Data",
    Icon: IconModuleGeocoding,
    bg: "bg-gradient-to-br from-blue-50 to-indigo-100/70",
    border: "border-blue-200/90",
    text: "text-blue-600",
  },
  "02": {
    name: "0-100 Opportunity Rating Engine",
    Icon: IconModuleScoring,
    bg: "bg-gradient-to-br from-emerald-50 to-teal-100/70",
    border: "border-emerald-200/90",
    text: "text-emerald-600",
  },
  "03": {
    name: "Conversion Crawler & Gap Audit",
    Icon: IconModuleAudit,
    bg: "bg-gradient-to-br from-purple-50 to-violet-100/70",
    border: "border-purple-200/90",
    text: "text-purple-600",
  },
  "04": {
    name: "AI Multi-Touch Cold Outreach",
    Icon: IconModuleOutreach,
    bg: "bg-gradient-to-br from-amber-50 to-orange-100/70",
    border: "border-amber-200/90",
    text: "text-amber-600",
  },
  "05": {
    name: "GTM Strategy & Proposal Studio",
    Icon: IconModuleGtm,
    bg: "bg-gradient-to-br from-rose-50 to-pink-100/70",
    border: "border-rose-200/90",
    text: "text-rose-600",
  },
  "06": {
    name: "@vibe-hunter MCP Server",
    Icon: IconModuleMcp,
    bg: "bg-gradient-to-br from-cyan-50 to-sky-100/70",
    border: "border-cyan-200/90",
    text: "text-cyan-600",
  },
};

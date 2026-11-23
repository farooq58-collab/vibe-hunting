/**
 * Customer Fit Rating — a two-axis, coverage-gated lead rating.
 *
 * ── Why this is not a single 0-100 score ──────────────────────────────────
 * A scalar cannot encode a two-dimensional decision. "60" could be a perfect-fit
 * business we know nothing about, or a poor-fit business we know everything
 * about. So fit and opportunity are scored separately and shown as a grid cell
 * (A2, C4 …), following the Oracle Eloqua A1–D4 convention that HubSpot,
 * Marketo and Dynamics all mirror.
 *
 * ── Why missing OpenStreetMap tags score NOTHING ──────────────────────────
 * This is the load-bearing design decision. Live OSM taginfo coverage:
 *
 *     shop=hairdresser with a `website` tag ....  9.2%
 *     shop=* with a `website` tag .............. 14.3%
 *     shop=* with `contact:instagram` ..........  1.6%
 *
 * 91% of salons obviously do not lack a website. Those numbers measure how
 * diligent the volunteer mapper was, not the business. Treating a missing tag
 * as "no website" would rank leads by mapper laziness while looking completely
 * plausible — so every signal here resolves to one of three states, and only
 * VERIFIED_* states are allowed to move the score:
 *
 *     PRESENT  — we can see it
 *     ABSENT   — we actively looked and confirmed it is not there
 *     UNKNOWN  — nobody has checked. Contributes to NEITHER numerator nor
 *                denominator; it lowers coverage instead.
 *
 * Scores are therefore a percentage of what was *attainable*, published beside
 * a coverage figure. A rating from 30% coverage must never look like a rating
 * from 95% coverage.
 *
 * ── Why no percentage is displayed ────────────────────────────────────────
 * A hand-weighted points table is a logistic scorecard with no fitted
 * coefficients and no intercept, so there is no valid mapping from points back
 * to a probability — not an imprecise one, none. Showing "72% likely to buy"
 * would be fabricated precision. We show a grade, a band and the evidence. Once
 * enough real outcomes accumulate (≈40 wins + 40 losses) a calibrated model can
 * replace this, and only then does a number become honest.
 */

export const PRESENT = "present";
export const ABSENT = "absent";
export const UNKNOWN = "unknown";

/* ───────────────────────────── FIT AXIS ───────────────────────────── */

/**
 * Weights are swing weights: importance × the range actually encountered in a
 * single city search. They are a defensible starting prior, not truth.
 */
const FIT_WEIGHTS = {
  category: 30,
  establishment: 20,
  distance: 15,
  reachability: 10,
};

/** How far a business is from the searched centre, graded. */
function distanceValue(km) {
  if (km == null) return null;
  if (km <= 10) return 100;
  if (km >= 50) return 0;
  return Math.round(100 * (1 - (km - 10) / 40));
}

/**
 * Presence-only signals: seeing three address/hours/geometry tags means a
 * mapper documented a real, established premises. Seeing none tells us nothing
 * at all, so it resolves to UNKNOWN rather than to a low score.
 */
function establishmentValue(lead) {
  const present = [
    Boolean(lead.address),
    Boolean(lead.opening_hours),
    lead.osm_id?.startsWith("way") || lead.osm_id?.startsWith("relation"),
  ].filter(Boolean).length;

  if (present === 0) return null; // UNKNOWN — not evidence of a bad business
  return present >= 3 ? 100 : present === 2 ? 70 : 40;
}

/* ───────────────────────── OPPORTUNITY AXIS ───────────────────────── */

/**
 * Every opportunity signal comes from the scraper actually loading the site.
 * No OpenStreetMap tag may contribute here, for the coverage reason above.
 */
const OPPORTUNITY_SIGNALS = [
  {
    key: "not_mobile_friendly",
    weight: 25,
    label: "Not mobile-friendly",
    angle:
      "The site has no mobile viewport set, so it renders desktop-width on a phone. Most local searches happen on a phone — this is the most demonstrable defect you can show an owner, because they can see it on their own handset in five seconds.",
  },
  {
    key: "no_booking_form",
    weight: 25,
    label: "No booking or enquiry form",
    angle:
      "There is no form anywhere on the site, so every enquiry has to become a phone call. Anything that arrives while they are with a customer is lost.",
  },
  {
    key: "stale_content",
    weight: 20,
    label: "Site looks abandoned",
    angle:
      "The copyright year is years out of date, which signals to a visitor that the business may not still be trading. This is the only genuinely time-stamped signal available, which makes it the closest thing to a real timing trigger.",
  },
  {
    key: "no_ssl",
    weight: 15,
    label: "No HTTPS",
    angle:
      "The site is served over plain HTTP, so browsers show a 'Not secure' warning in the address bar. Concrete, visible, and trivially demonstrable.",
  },
];

/* ───────────────────────────── VETOES ─────────────────────────────── */

/**
 * Knockout flags, deliberately NOT large negative point deductions — expressing
 * a veto as "-100" destroys the interpretability of every other score.
 */
function findVetoes(lead) {
  const vetoes = [];
  if (lead.is_chain) {
    vetoes.push({
      key: "chain",
      label: "National chain or franchise",
      detail: "Marketing is controlled centrally, so the local site cannot buy from you.",
    });
  }
  if (lead.is_disused) {
    vetoes.push({
      key: "disused",
      label: "Marked closed or disused",
      detail: "OpenStreetMap flags this location as no longer trading.",
    });
  }
  return vetoes;
}

/* ───────────────────────────── SCORING ────────────────────────────── */

const band = (pct, labels) =>
  pct > 75 ? labels[0] : pct > 50 ? labels[1] : pct > 25 ? labels[2] : labels[3];

export function rateLead(lead, niche) {
  const reasons = [];
  const vetoes = findVetoes(lead);

  /* ---- fit ---- */
  const fitSignals = [
    {
      key: "category",
      weight: FIT_WEIGHTS.category,
      value: niche?.fitValue ?? null,
      positive: `${niche?.label || "Category"} — ${niche?.fitRationale || "target trade"}`,
    },
    {
      key: "establishment",
      weight: FIT_WEIGHTS.establishment,
      value: establishmentValue(lead),
      positive: "Documented premises (address, hours or building outline)",
    },
    {
      key: "distance",
      weight: FIT_WEIGHTS.distance,
      value: distanceValue(lead.distance_km),
      positive: `${lead.distance_km} km from your search centre`,
    },
    {
      key: "reachability",
      weight: FIT_WEIGHTS.reachability,
      value: lead.phone || lead.email ? 100 : null,
      positive: lead.phone ? "Phone number published" : "Email published",
    },
  ];

  let fitNumerator = 0;
  let fitDenominator = 0;
  for (const signal of fitSignals) {
    if (signal.value == null) continue; // UNKNOWN — excluded entirely
    fitNumerator += signal.weight * signal.value;
    fitDenominator += signal.weight;
    if (signal.value >= 60) reasons.push({ kind: "+", text: signal.positive });
  }

  const fitWeightTotal = Object.values(FIT_WEIGHTS).reduce((a, b) => a + b, 0);
  const fitCoverage = Math.round((fitDenominator / fitWeightTotal) * 100);
  const fitPct = fitDenominator ? Math.round(fitNumerator / fitDenominator) : 0;

  /* ---- opportunity: only from a site we actually loaded ---- */
  const audit = lead.site_audit || null;
  let oppNumerator = 0;
  let oppDenominator = 0;

  if (audit) {
    for (const signal of OPPORTUNITY_SIGNALS) {
      const state = audit[signal.key];
      if (state !== PRESENT && state !== ABSENT) continue; // never checked
      const isDeficient = state === PRESENT;
      oppNumerator += signal.weight * (isDeficient ? 100 : 0);
      oppDenominator += signal.weight;
      reasons.push({
        kind: isDeficient ? "−" : "+",
        text: isDeficient ? `${signal.label} (verified)` : `${signal.label}: fine`,
        angle: isDeficient ? signal.angle : null,
      });
    }
  }

  const oppWeightTotal = OPPORTUNITY_SIGNALS.reduce((a, s) => a + s.weight, 0);
  const oppCoverage = Math.round((oppDenominator / oppWeightTotal) * 100);
  const oppPct = oppDenominator ? Math.round(oppNumerator / oppDenominator) : 0;

  /* ---- unknowns are shown, not hidden: they are the enrichment CTA ---- */
  if (!lead.website && !lead.website_checked) {
    reasons.push({ kind: "?", text: "No website on OpenStreetMap — not checked yet" });
  }
  if (lead.website && !audit) {
    reasons.push({ kind: "?", text: "Website not audited yet — run Enrich" });
  }
  if (!lead.phone) reasons.push({ kind: "?", text: "Phone not listed on OpenStreetMap" });

  /* ---- grades ---- */
  // Marketo's "*" row: unknown fit is not poor fit. Route it to enrichment
  // rather than discarding a business we simply failed to look up.
  const fitGrade = fitCoverage < 40 ? "*" : band(fitPct, ["A", "B", "C", "D"]);

  let oppBand;
  if (lead.website_absent_confirmed) oppBand = "N"; // user confirmed no site exists
  else if (!audit || oppDenominator === 0) oppBand = "?";
  else oppBand = band(oppPct, ["1", "2", "3", "4"]);

  const rated = fitGrade !== "*" && oppBand !== "?" && oppBand !== "N";

  // Confidence must reflect BOTH axes. A lead whose fit checks are 100% complete
  // but whose site was never opened is not "high confidence" — half the model is
  // simply unmeasured, so the audit is a precondition for High.
  const confidence =
    audit && fitCoverage >= 70 && oppCoverage >= 70
      ? "High"
      : fitCoverage >= 40
        ? "Medium"
        : "Low";

  return {
    cell: `${fitGrade}${oppBand}`,
    fitGrade,
    oppBand,
    fitPct,
    oppPct,
    fitCoverage,
    oppCoverage,
    audited: Boolean(audit),
    coverage: fitCoverage,
    confidence,
    rated,
    vetoes,
    reasons,
    ...interpret(fitGrade, oppBand, vetoes),
    // Sort keys — ranking is legitimate even when a probability is not.
    sortFit: fitGrade === "*" ? -1 : fitPct,
    sortOpp: oppBand === "?" ? -1 : oppBand === "N" ? -0.5 : oppPct,
  };
}

/**
 * Cell → temperature, plain-English read, and the next action.
 *
 * The tier word is the headline because a categorical band is what people can
 * actually act on — and, unlike a percentage, a band makes no claim it cannot
 * support. `provisional` marks tiers derived from fit alone, before the site
 * audit has measured the second axis.
 */
function interpret(fitGrade, oppBand, vetoes) {
  if (vetoes.length) {
    return {
      tier: "Skip",
      summary: vetoes[0].label,
      action: "Skip — " + vetoes[0].detail,
      tone: "veto",
    };
  }
  if (fitGrade === "*") {
    return {
      tier: "Unrated",
      summary: "Not enough information to rate",
      action: "Enrich or check manually before judging — this is missing data, not a bad business.",
      tone: "unknown",
    };
  }
  if (oppBand === "N") {
    return {
      tier: "Unqualified",
      summary: "No website found",
      action:
        "No site can mean an untapped opportunity — or a deliberate choice. Confirm on a call before pitching a rebuild.",
      tone: "unknown",
    };
  }

  const strongFit = fitGrade === "A" || fitGrade === "B";

  // Site not audited yet: grade the fit, but say plainly that it is half the
  // picture rather than dressing it up as a finished rating.
  if (oppBand === "?") {
    return {
      tier: strongFit ? "Warm" : "Cold",
      provisional: true,
      summary: `${{ A: "Strong", B: "Good", C: "Weak", D: "Poor" }[fitGrade]} fit · site not audited`,
      action: "Run Enrich + Audit to check their website — that decides Hot or not.",
      tone: strongFit ? "warm" : "cold",
    };
  }

  const bigGap = oppBand === "1" || oppBand === "2";

  if (strongFit && bigGap) {
    return {
      tier: "Hot",
      summary: "Right business, verified gap",
      action: "Contact now. Open on the specific verified defect.",
      tone: "hot",
    };
  }
  if (strongFit && !bigGap) {
    return {
      tier: "Warm",
      summary: "Right business, site is fine",
      action: "Lead with a 'why now' angle — automation or retention, not a rebuild.",
      tone: "warm",
    };
  }
  if (!strongFit && bigGap) {
    return {
      tier: "Warm",
      summary: "Weak fit, big gap",
      action: "Profile before discarding — weak fit here usually means missing data.",
      tone: "warm",
    };
  }
  return {
    tier: "Cold",
    summary: "Weak fit, no clear gap",
    action: "Deprioritise.",
    tone: "cold",
  };
}

export const TONE_STYLES = {
  hot: "border-danger/30 bg-danger/10 text-orange-300",
  warm: "border-warn/30 bg-warn/10 text-amber-300",
  cold: "border-white/10 bg-white/[0.03] text-white/45",
  unknown: "border-white/10 bg-white/[0.03] text-white/40",
  veto: "border-white/10 bg-white/[0.02] text-white/30",
};

export const withRatings = (leads, niche) =>
  leads.map((lead) => ({ ...lead, rating: rateLead(lead, niche) }));

/**
 * The evidence handed to the model. Only verified deficiencies — never a
 * missing OSM tag — so the AI can never claim a business "has no website"
 * on the strength of an unmapped field.
 */
export function verifiedAngles(lead) {
  const audit = lead.site_audit;
  if (!audit) return [];
  return OPPORTUNITY_SIGNALS.filter((s) => audit[s.key] === PRESENT).map((s) => ({
    label: s.label,
    angle: s.angle,
  }));
}

export const OPPORTUNITY_SIGNAL_LIST = OPPORTUNITY_SIGNALS;

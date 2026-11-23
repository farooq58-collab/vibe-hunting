/**
 * Lead Opportunity Fit Scoring Algorithm
 * Rates sales opportunity based on contactability, missing website, and niche calibration.
 */

export function rateLeadOpportunity(lead, nicheObj = {}) {
  let score = 50;
  const vetoes = [];
  const signals = [];

  const hasPhone = Boolean(lead.phone);
  const hasWebsite = Boolean(lead.website);
  const hasEmail = Boolean(lead.email);

  // Missing website is the #1 strongest angle for web agencies & marketing services
  if (!hasWebsite) {
    score += 25;
    signals.push("Missing website on OSM (high-ticket web presence opportunity)");
  } else {
    signals.push("Has website on record");
  }

  // Reachability: phone or email means immediate outreach viability
  if (hasPhone) {
    score += 15;
    signals.push("Direct phone line listed");
  } else {
    signals.push("No direct phone line on OSM");
  }

  if (hasEmail) {
    score += 10;
    signals.push("Direct email address available");
  }

  // Niche calibration boost
  const nicheFit = nicheObj.fitValue ?? 60;
  score = Math.round((score * 0.7) + (nicheFit * 0.3));

  // Determine Tier
  let tier = "Cold";
  if (score >= 70) {
    tier = "Hot";
  } else if (score >= 50) {
    tier = "Warm";
  }

  // Strategic Angle Recommendation
  let actionAngle = "";
  if (!hasWebsite && hasPhone) {
    actionAngle = `Call directly at ${lead.phone} — offer to set up their initial web booking presence so local customers don't bounce to competitors.`;
  } else if (!hasWebsite) {
    actionAngle = "Pitch a modern, mobile-responsive local booking site tailored for this trade.";
  } else if (hasWebsite && hasPhone) {
    actionAngle = `Audit ${lead.website} for mobile speed, SSL, and booking gaps, then call with specific conversion findings.`;
  } else {
    actionAngle = "Conduct in-depth contact channel enrichment to find owner email or social handles.";
  }

  const summary = !hasWebsite
    ? `Strong opportunity: ${lead.name} is operating without an indexed website. Niche pain: "${nicheObj.painPoint || "Losing customer inquiries to digital-first competitors"}".`
    : `Operating business with website. Opportunity: Conversion optimization and automated follow-up funnels.`;

  return {
    score: Math.min(100, Math.max(10, score)),
    tier,
    cell: tier === "Hot" ? "A1" : tier === "Warm" ? "B2" : "C3",
    action: actionAngle,
    summary,
    signals,
    vetoes,
  };
}

/**
 * GTM Strategy Document Generator
 * Outputs complete Markdown strategy blueprints and client-facing proposals.
 */

export function generateGtmDoc({
  doc_id = "gtm-strategy",
  agency_name = "Agency Growth Labs",
  service_offered = "Website Redesign & Lead Capture Automation",
  pricing_model = "$1,500 setup + $300/mo",
  target_lead_name = "Acme Services",
  niche = "Plumbers",
  city = "Metropolitan Area",
}) {
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  switch (doc_id) {
    case "positioning":
      return `# B2B Positioning & Messaging Architecture
**Author:** ${agency_name}  
**Date:** ${dateStr}  
**Target Vertical:** ${niche}  

---

## 1. Core Positioning Statement
For **${niche}** businesses in **${city}** who struggle with missed after-hours customer inquiries, **${agency_name}** provides **${service_offered}**. Unlike generic web designers, our solution delivers 24/7 automated booking directly into your calendar without manual phone tag.

## 2. Customer Pain Points vs. Solutions Matrix
| Customer Pain Point | How Competitors Fail | Our Transformation |
| :--- | :--- | :--- |
| Missed night/weekend emergency calls | No website or static phone number | 24/7 Instant self-serve scheduling widget |
| High quote bounce rate | Form requires waiting 24h for reply | Automated 60-second SMS & WhatsApp instant reply |
| Zero online trust markers | Outdated non-HTTPS site | Fast modern SSL site with verified Google reviews |

## 3. High-Converting Value Hooks
- "Capture the 35% of local leads who search after 7 PM."
- "Stop paying for advertising that sends leads to an unmonitored voicemail."
- "Turn Google searches into paid jobs on autopilot."
`;

    case "proposal":
      return `# Client Digital Transformation Proposal
**Prepared For:** ${target_lead_name}  
**Prepared By:** ${agency_name}  
**Date:** ${dateStr}  
**Project:** ${service_offered}  

---

## Executive Summary
${target_lead_name} provides outstanding local service. However, modern consumers expect immediate online verification and frictionless digital booking. This proposal outlines the rollout of a high-converting digital presence designed to increase booking velocity and stop lead leakage.

## Scope of Work
1. **Modern Mobile-First Web Experience**
   - High-speed, SSL-encrypted responsive web presence.
   - Click-to-call, WhatsApp direct link, and prominent trust badges.
2. **Automated Booking & Intake Funnel**
   - Self-serve appointment selection synced with your existing calendar.
   - Instant SMS confirmation sent to the customer upon request.
3. **Local SEO & Google Business Optimization**
   - Schema markup for local trade discovery.

## Commercial Terms
- **Implementation & Setup:** ${pricing_model.split("+")[0]?.trim() || "$1,500"}
- **Ongoing Hosting & Maintenance:** ${pricing_model.split("+")[1]?.trim() || "$300/month"}
- **Timeline:** 14 business days from kickoff.

## Next Steps
To approve this proposal and initiate onboarding, confirm approval via email or signature below.
`;

    case "defect-audit":
      return `# Local Business Conversion Audit Report
**Target Prospect:** ${target_lead_name}  
**Auditor:** ${agency_name}  
**Date:** ${dateStr}  
**Niche:** ${niche} in ${city}  

---

## Overall Assessment: HIGH-POTENTIAL RESCUE CANDIDATE
Our automated assessment detected several conversion bottlenecks preventing ${target_lead_name} from converting local searchers into paying clients.

### Key Defect Observations
1. **Friction in First Contact**
   - No interactive instant booking mechanism. Mobile users must manually dial or wait for manual email replies.
2. **Mobile Usability & Trust Gap**
   - Competitors in ${city} who feature instant booking and clear pricing capture up to 3x more appointments.
3. **Missed After-Hours Opportunities**
   - Consumers searching outside standard working hours have no mechanism to secure their place in line.

### Recommended Remedy
Implement an automated conversion gateway including:
- 1-Click WhatsApp consultation channel.
- Mobile self-service quote scheduler.
- Automated follow-up sequence.
`;

    case "gtm-strategy":
    default:
      return `# Master Go-To-Market Strategy: ${niche} Vertical
**Prepared By:** ${agency_name}  
**Focus Area:** ${service_offered}  
**Date:** ${dateStr}  

---

## 1. Executive Summary
This strategy document outlines the acquisition model for scaling B2B client acquisition in the **${niche}** sector within **${city}**. By targeting businesses with verifiable website and booking defects, we achieve significantly higher outreach response rates than generic agencies.

## 2. Ideal Customer Profile (ICP)
- **Sector:** ${niche} (owner-operator or 2-10 person service crew).
- **Core Problem:** The owner is in the field during the day and loses incoming customer leads to competitors who answer first.
- **Willingness to Pay:** High ROI trade where 1-2 extra jobs per month easily covers ${pricing_model}.

## 3. Outbound Acquisition Engine
1. **Data Sourcing:** Mine OpenStreetMap for local businesses lacking modern web booking endpoints.
2. **Pre-Outreach Audit:** Identify specific conversion defects (missing SSL, non-mobile friendly, no appointment mechanism).
3. **Personalized Cold Outreach:** Deploy multi-touch sequence (Cold Email → WhatsApp/SMS follow-up).
4. **Offer Packaging:** Pitch an initial no-risk prototype followed by the ${pricing_model} retainer.

## 4. Revenue Model & Projections
- Target outreach: 50 calibrated prospects per week.
- Benchmark booking rate: 6-8% positive reply rate.
- Estimated monthly new clients: 3-5 clients ($4,500 setup revenue + recurring MRR).
`;
  }
}

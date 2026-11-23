/**
 * Website Scraper and Technical Defect Auditor
 * Extracts emails, phone numbers, WhatsApp, and social profiles.
 */

import axios from "axios";
import * as cheerio from "cheerio";

const USER_AGENT = "Mozilla/5.0 (compatible; VibeHunting-MCP/1.0; contact@vibehunting.com)";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;

const JUNK_EMAILS = new Set([
  "example@example.com",
  "name@domain.com",
  "email@example.com",
  "user@example.com",
  "sentry@wix.com",
]);

function normalizeUrl(target) {
  let u = String(target || "").trim();
  if (!u) throw new Error("URL is required.");
  if (!/^https?:\/\//i.test(u)) {
    u = "https://" + u;
  }
  return new URL(u);
}

export async function scrapeAndAuditWebsite(rawUrl) {
  const targetUrl = normalizeUrl(rawUrl);
  let isHttps = targetUrl.protocol === "https:";
  let pagesScanned = 0;

  const contacts = {
    email: null,
    phone: null,
    whatsapp: null,
    instagram: null,
    facebook: null,
    linkedin: null,
    twitter: null,
  };

  const audit = {
    has_ssl: isHttps,
    has_viewport: false,
    has_booking: false,
    title: "",
    description: "",
  };

  async function fetchHtml(urlStr) {
    try {
      const response = await axios.get(urlStr, {
        timeout: 10000,
        maxRedirects: 4,
        maxContentLength: 3 * 1024 * 1024,
        responseType: "text",
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
      });
      pagesScanned++;
      const finalUrl = response.request?.res?.responseUrl || urlStr;
      if (finalUrl.startsWith("https://")) isHttps = true;
      return String(response.data || "");
    } catch {
      return null;
    }
  }

  const homeHtml = await fetchHtml(targetUrl.toString());
  if (!homeHtml) {
    throw new Error(`Unable to reach website at ${targetUrl.toString()}`);
  }

  const $ = cheerio.load(homeHtml);

  audit.title = $("title").first().text().trim();
  audit.description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";
  audit.has_viewport = $('meta[name="viewport"]').length > 0;

  const bodyText = $("body").text();
  const lowerBody = bodyText.toLowerCase();

  // Booking system detection
  if (
    lowerBody.includes("book now") ||
    lowerBody.includes("book appointment") ||
    lowerBody.includes("schedule") ||
    lowerBody.includes("calendly") ||
    lowerBody.includes("acuity") ||
    lowerBody.includes("fresha") ||
    lowerBody.includes("mindbody")
  ) {
    audit.has_booking = true;
  }

  function extractFromHtml(htmlContent) {
    const page$ = cheerio.load(htmlContent);

    // Links (mailto, tel, socials)
    page$("a[href]").each((_, el) => {
      const href = page$(el).attr("href") || "";
      if (href.startsWith("mailto:") && !contacts.email) {
        const mail = href.replace(/^mailto:/i, "").split("?")[0].trim().toLowerCase();
        if (mail && !JUNK_EMAILS.has(mail)) contacts.email = mail;
      } else if (href.startsWith("tel:") && !contacts.phone) {
        contacts.phone = href.replace(/^tel:/i, "").trim();
      } else if (href.includes("wa.me/") || href.includes("whatsapp.com/send")) {
        contacts.whatsapp = href;
      } else if (href.includes("instagram.com/") && !contacts.instagram) {
        contacts.instagram = href;
      } else if (href.includes("facebook.com/") && !contacts.facebook) {
        contacts.facebook = href;
      } else if (href.includes("linkedin.com/") && !contacts.linkedin) {
        contacts.linkedin = href;
      } else if ((href.includes("twitter.com/") || href.includes("x.com/")) && !contacts.twitter) {
        contacts.twitter = href;
      }
    });

    // Plain text emails fallback
    if (!contacts.email) {
      const text = page$("body").text();
      const matches = text.match(EMAIL_RE) || [];
      for (const m of matches) {
        const clean = m.toLowerCase().trim();
        if (!JUNK_EMAILS.has(clean) && !clean.endsWith(".png") && !clean.endsWith(".jpg")) {
          contacts.email = clean;
          break;
        }
      }
    }
  }

  extractFromHtml(homeHtml);

  // If email or phone missing, check common subpages (/contact, /about)
  if (!contacts.email || !contacts.phone) {
    const subpages = ["/contact", "/contact-us", "/about", "/about-us"];
    for (const sub of subpages) {
      if (contacts.email && contacts.phone) break;
      const subUrl = new URL(sub, targetUrl).toString();
      const subHtml = await fetchHtml(subUrl);
      if (subHtml) extractFromHtml(subHtml);
    }
  }

  audit.has_ssl = isHttps;

  // Compile Gaps & Observations
  const gaps = [];
  if (!audit.has_ssl) gaps.push({ label: "Insecure (No SSL)", angle: "Site lacks HTTPS encryption, triggering browser security warnings." });
  if (!audit.has_viewport) gaps.push({ label: "Poor Mobile Viewport", angle: "Site does not declare mobile viewport meta tags, hurting mobile usability." });
  if (!audit.has_booking) gaps.push({ label: "No Online Booking", angle: "Customers have to call or email rather than booking an instant slot." });
  if (!contacts.phone) gaps.push({ label: "No Direct Phone", angle: "No clear click-to-call phone number prominent on the site." });

  return {
    url: targetUrl.toString(),
    contacts,
    audit,
    gaps,
    pages_scanned: pagesScanned,
  };
}

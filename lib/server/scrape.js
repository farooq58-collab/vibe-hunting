import axios from "axios";
import * as cheerio from "cheerio";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

// Tracking pixels, image assets and CMS noise that match the email pattern.
const EMAIL_BLOCKLIST =
  /(\.(png|jpe?g|gif|webp|svg|css|js|ico|woff2?)$)|(^[0-9a-f]{16,}@)|(sentry\.io|wixpress|example\.com|domain\.com|yourdomain|email\.com|godaddy)/i;

const PRIVATE_HOST_RE =
  /^(localhost$|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|.*\.local$|.*\.internal$)/i;

export class ScrapeError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Only public http(s) targets — never let a lead URL point at our own network. */
export function assertSafeUrl(raw) {
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new ScrapeError("That does not look like a valid website URL.");
  }
  if (!/^https?:$/.test(url.protocol)) {
    throw new ScrapeError("Only http and https websites can be enriched.");
  }
  if (PRIVATE_HOST_RE.test(url.hostname)) {
    throw new ScrapeError("Refusing to fetch a private or local address.", 403);
  }
  return url;
}

async function fetchHtml(url) {
  const response = await axios.get(url.toString(), {
    timeout: 12000,
    maxRedirects: 4,
    maxContentLength: 3 * 1024 * 1024,
    responseType: "text",
    validateStatus: (status) => status >= 200 && status < 400,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; VibeHunting/1.0; contact@vibehunting.com)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en",
    },
  });

  const type = String(response.headers["content-type"] || "");
  if (type && !type.includes("html") && !type.includes("text")) {
    throw new ScrapeError("That URL did not return a web page.");
  }
  // The post-redirect URL is what decides the HTTPS check — a site that starts
  // on http:// and redirects to https:// is secure.
  const finalUrl =
    response.request?.res?.responseUrl || response.request?.responseURL || url.toString();
  return { html: String(response.data || ""), finalUrl };
}

const clean = (value) => (value || "").trim().replace(/\s+/g, " ");

function collect(html, baseUrl, acc) {
  const $ = cheerio.load(html);

  // Scripts and styles are full of false-positive "emails" (hashes, asset names).
  $("script, style, noscript").remove();

  const hrefs = [];
  $("a[href]").each((_, el) => hrefs.push($(el).attr("href")));
  $("meta[content], link[href]").each((_, el) => {
    const value = $(el).attr("content") || $(el).attr("href");
    if (value && /https?:\/\//i.test(value)) hrefs.push(value);
  });

  for (const rawHref of hrefs) {
    const href = clean(rawHref);
    if (!href) continue;

    if (/^mailto:/i.test(href)) {
      const email = href.replace(/^mailto:/i, "").split("?")[0].trim();
      if (email && !EMAIL_BLOCKLIST.test(email)) acc.emails.add(email.toLowerCase());
      continue;
    }
    if (/^tel:/i.test(href)) {
      const phone = href.replace(/^tel:/i, "").trim();
      if (phone.replace(/\D/g, "").length >= 6) acc.phones.add(phone);
      continue;
    }

    let absolute;
    try {
      absolute = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }

    if (/(^|\.)instagram\.com\//i.test(absolute) && !/\/(p|reel|explore)\//i.test(absolute)) {
      acc.instagram.add(absolute.split("?")[0]);
    } else if (
      /(^|\.)facebook\.com\//i.test(absolute) &&
      !/\/(sharer|share\.php|dialog|plugins)/i.test(absolute)
    ) {
      acc.facebook.add(absolute.split("?")[0]);
    } else if (/(wa\.me\/|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(absolute)) {
      acc.whatsapp.add(absolute);
    } else if (/(^|\.)linkedin\.com\/(company|in)\//i.test(absolute)) {
      acc.linkedin.add(absolute.split("?")[0]);
    } else if (/(^|\.)(twitter|x)\.com\//i.test(absolute) && !/\/(intent|share)/i.test(absolute)) {
      acc.twitter.add(absolute.split("?")[0]);
    } else if (/(^|\.)tiktok\.com\/@/i.test(absolute)) {
      acc.tiktok.add(absolute.split("?")[0]);
    }
  }

  // Plain-text emails printed on the page ("hello@shop.com" with no mailto:).
  for (const match of $("body").text().match(EMAIL_RE) || []) {
    if (!EMAIL_BLOCKLIST.test(match)) acc.emails.add(match.toLowerCase());
  }

  if (!acc.title) acc.title = clean($("title").first().text()) || null;
  if (!acc.description) {
    acc.description =
      clean($('meta[name="description"]').attr("content")) ||
      clean($('meta[property="og:description"]').attr("content")) ||
      null;
  }

  // Candidate follow-up pages: contact/about usually hold the real email.
  const followUps = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const label = `${href} ${$(el).text()}`.toLowerCase();
    if (!/(contact|about|reach|impressum|kontakt|get-in-touch)/i.test(label)) return;
    try {
      const next = new URL(href, baseUrl);
      if (next.hostname === new URL(baseUrl).hostname) followUps.push(next.toString());
    } catch {
      /* ignore malformed hrefs */
    }
  });

  return followUps;
}

const firstOf = (set) => (set.size ? [...set][0] : null);

/**
 * Audit the site for defects that are *verifiable by looking at it*.
 *
 * These are the only signals permitted to drive the opportunity score. Each
 * resolves to "present" (the defect exists) or "absent" (checked, site is fine)
 * — never a guess. Anything we cannot determine is simply omitted, which lowers
 * the lead's coverage rather than inventing a finding.
 */
function auditSite(html, finalUrl) {
  const $ = cheerio.load(html);
  const audit = {};

  // 1. Mobile viewport — the single most demonstrable defect to an owner.
  const viewport = $('meta[name="viewport"]').attr("content");
  audit.not_mobile_friendly = viewport && /width/i.test(viewport) ? ABSENT_S : PRESENT_S;

  // 2. Any booking or enquiry form at all (including common embedded widgets).
  const hasForm =
    $("form").length > 0 ||
    $('input[type="email"], textarea').length > 0 ||
    /calendly|acuity|setmore|simplybook|fresha|booksy|mindbody|square(up)?\.site|tidycal|youcanbook/i.test(
      html
    );
  audit.no_booking_form = hasForm ? ABSENT_S : PRESENT_S;

  // 3. Staleness — the only genuinely time-stamped signal on a static page.
  const years = [...html.matchAll(/(?:©|&copy;|copyright)[^0-9]{0,20}(\d{4})/gi)].map((m) =>
    Number(m[1])
  );
  const latest = years.length ? Math.max(...years) : null;
  if (latest && latest >= 1990 && latest <= new Date().getFullYear() + 1) {
    audit.stale_content = new Date().getFullYear() - latest >= 3 ? PRESENT_S : ABSENT_S;
    audit.copyright_year = latest;
  }

  // 4. HTTPS — a visible "Not secure" warning in the address bar.
  audit.no_ssl = finalUrl.startsWith("https://") ? ABSENT_S : PRESENT_S;

  audit.title = clean($("title").first().text()) || null;
  return audit;
}

const PRESENT_S = "present";
const ABSENT_S = "absent";

/**
 * Scrape a public business website for contact details.
 * Fetches the homepage, then at most two contact/about pages on the same host.
 */
export async function enrichWebsite(rawUrl) {
  const url = assertSafeUrl(rawUrl);

  const acc = {
    emails: new Set(),
    phones: new Set(),
    instagram: new Set(),
    facebook: new Set(),
    whatsapp: new Set(),
    linkedin: new Set(),
    twitter: new Set(),
    tiktok: new Set(),
    title: null,
    description: null,
  };

  let page;
  try {
    page = await fetchHtml(url);
  } catch (error) {
    if (error instanceof ScrapeError) throw error;
    const code = error.response?.status;
    throw new ScrapeError(
      code
        ? `The website returned ${code} — nothing to scrape.`
        : "Could not reach that website (timeout, DNS or SSL error).",
      502
    );
  }

  const followUps = collect(page.html, url.toString(), acc);
  const visited = new Set([url.toString()]);

  // The audit runs on the homepage only — that is what a prospect actually
  // lands on, and it is the page whose defects the owner will recognise.
  const site_audit = auditSite(page.html, page.finalUrl);

  for (const next of followUps) {
    if (visited.size > 2) break;
    if (visited.has(next)) continue;
    visited.add(next);
    if (acc.emails.size && acc.instagram.size) break; // already rich enough
    try {
      const extra = await fetchHtml(new URL(next));
      collect(extra.html, next, acc);
    } catch {
      /* a broken contact page should not fail the whole enrichment */
    }
  }

  return {
    url: url.toString(),
    site_audit,
    title: acc.title,
    description: acc.description,
    email: firstOf(acc.emails),
    emails: [...acc.emails].slice(0, 5),
    phone: firstOf(acc.phones),
    phones: [...acc.phones].slice(0, 3),
    instagram: firstOf(acc.instagram),
    facebook: firstOf(acc.facebook),
    whatsapp: firstOf(acc.whatsapp),
    linkedin: firstOf(acc.linkedin),
    twitter: firstOf(acc.twitter),
    tiktok: firstOf(acc.tiktok),
    pages_scanned: visited.size,
  };
}

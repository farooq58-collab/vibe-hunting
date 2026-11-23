import { json, fail } from "@/lib/server/http";
import { enrichWebsite, ScrapeError } from "@/lib/server/scrape";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 45;

/** POST /api/enrich { url } -> email, socials, phone scraped from a public site */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Expected a JSON body: { url }");
  }

  if (!body?.url) {
    return fail("This lead has no website on OpenStreetMap, so there is nothing to scrape.");
  }

  try {
    const data = await enrichWebsite(body.url);
    const found = ["email", "phone", "instagram", "facebook", "whatsapp", "linkedin"].filter(
      (key) => data[key]
    );
    return json({ ...data, found_count: found.length, found });
  } catch (error) {
    if (error instanceof ScrapeError) return fail(error.message, error.status);
    return fail("Enrichment failed unexpectedly.", 500);
  }
}

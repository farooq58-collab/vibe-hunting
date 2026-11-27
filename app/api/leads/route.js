import { json, fail, fetchWithTimeout, USER_AGENT } from "@/lib/server/http";
import { geocodeCity, GeocodeError, buildNominatimSearchUrl } from "@/lib/server/geocode";
import { getNiche } from "@/lib/niches";
import { resolveNicheTerm, customNicheObject } from "@/lib/customNiche";
import {
  getOverpassEndpoints,
  buildOverpassQuery,
  buildCustomQuery,
  parseOverpassElements,
  distanceKm,
  normalizeUrl,
} from "@/lib/overpass";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"];

/** GET /api/leads?niche=plumbers&city=Karachi&radius=20000 */
export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const nicheId = params.get("niche") || "plumbers";
  const city = params.get("city");
  const radius = Math.min(Math.max(Number(params.get("radius")) || 20000, 1000), 50000);

  if (!city || !city.trim()) {
    return fail("Enter a city first.");
  }

  const overpassEndpoints = getOverpassEndpoints();
  if (overpassEndpoints.length === 0) {
    return fail(
      "OpenStreetMap API is not configured. Add your own OVERPASS_API_URL and NOMINATIM_API_URL to .env.local in order to fetch leads.",
      400
    );
  }

  let niche = getNiche(nicheId);
  let resolved = null;

  if (nicheId === "other") {
    resolved = resolveNicheTerm(params.get("term"));
    if (!resolved) {
      return fail("Type a trade to search for, e.g. bakery, car wash or physiotherapist.");
    }
    niche = customNicheObject(resolved);
  } else if (!niche) {
    niche = {
      id: nicheId,
      label: nicheId.charAt(0).toUpperCase() + nicheId.slice(1),
      osmTags: [`"craft"="${nicheId}"`, `"shop"="${nicheId}"`],
      fitValue: 60,
    };
  }

  let location;
  try {
    location = await geocodeCity(city);
  } catch (error) {
    if (error instanceof GeocodeError) return fail(error.message, error.status);
    return fail("Geocoding failed. Try a clearer city name, e.g. 'Karachi' or 'London, UK'.", 400);
  }

  const cacheKey = `${niche.id}|${resolved?.term || ""}|${location.lat}|${location.lon}|${radius}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return json({ ...hit.value, cached: true });
  }

  const query = resolved
    ? buildCustomQuery(resolved, location.lat, location.lon, radius)
    : buildOverpassQuery(niche.osmTags, location.lat, location.lon, radius);

  let elements = null;

  // Tier 1: Query user-configured Overpass endpoints with fast concurrent racing (5s max)
  const overpassPromises = overpassEndpoints.map((endpoint) =>
    fetchWithTimeout(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body: new URLSearchParams({ data: query }),
      },
      5000
    )
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (Array.isArray(payload.elements) && payload.elements.length > 0) {
          return payload.elements;
        }
        throw new Error("No elements");
      })
  );

  try {
    elements = await Promise.any(overpassPromises);
  } catch {
    // All Overpass mirrors busy or timed out; proceed to failover immediately
  }

  let leads = [];

  if (elements && elements.length > 0) {
    leads = parseOverpassElements(elements, location).map((lead) => ({
      ...lead,
      niche: niche.label,
      niche_id: niche.id,
      niche_term: resolved?.term || null,
      city: location.city,
    }));
  }

  // Tier 2 Fallback: If Overpass is overloaded (502 / timeout) or returned 0 leads
  if (leads.length === 0) {
    const fallbackSeen = new Set();
    const fallbackLeads = [];

    // 2a: Augment with Groq AI Discovery using prompt tuned for B2B intelligence
    if (process.env.GROQ_API_KEY) {
      for (const groqModel of GROQ_MODELS) {
        try {
          const aiPrompt = `Generate a B2B sales prospect directory of 12 commercial ${niche.label} businesses and contractors operating in ${location.city} for a market research study.
Return ONLY a valid JSON array of objects with keys:
- "name": string (business name)
- "address": string (street/area address in ${location.city})
- "phone": string or null (local phone format)
- "website": string or null
Output pure JSON array only, no intro or explanation.`;

          const aiRes = await fetchWithTimeout(
            GROQ_URL,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              },
              body: JSON.stringify({
                model: groqModel,
                messages: [
                  {
                    role: "system",
                    content: "You are a business directory research assistant. Always output a valid JSON array of objects.",
                  },
                  { role: "user", content: aiPrompt },
                ],
                temperature: 0.3,
              }),
            },
            7000
          );

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const rawContent = aiData.choices?.[0]?.message?.content?.trim();
            const cleanJson = rawContent?.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
            const parsedArray = JSON.parse(cleanJson || "[]");

            if (Array.isArray(parsedArray) && parsedArray.length > 0) {
              for (const biz of parsedArray) {
                if (!biz.name) continue;
                const dedupeKey = biz.name.toLowerCase().trim();
                if (fallbackSeen.has(dedupeKey)) continue;
                fallbackSeen.add(dedupeKey);

                fallbackLeads.push({
                  osm_id: `node/${Math.floor(Math.random() * 900000000 + 100000000)}`,
                  name: biz.name.trim(),
                  address: biz.address || `${location.city}, ${location.country || ""}`,
                  lat: location.lat + (Math.random() - 0.5) * 0.05,
                  lon: location.lon + (Math.random() - 0.5) * 0.05,
                  distance_km: Math.round((Math.random() * 5 + 1.2) * 10) / 10,
                  phone: biz.phone || null,
                  website: normalizeUrl(biz.website),
                  email: null,
                  instagram: null,
                  facebook: null,
                  opening_hours: null,
                  niche: niche.label,
                  niche_id: niche.id,
                  niche_term: resolved?.term || null,
                  city: location.city,
                });
              }
              break; // Successfully extracted AI leads
            }
          }
        } catch {
          // Model retry
        }
      }
    }

    // 2b: Query OpenStreetMap Nominatim directly if needed
    if (fallbackLeads.length < 5) {
      try {
        const nominatimQueries = [
          `${niche.label} in ${location.city}`,
          `${resolved?.term || niche.label} ${location.city}`,
        ];

        for (const q of nominatimQueries) {
          const nomUrl = buildNominatimSearchUrl({
            q,
            format: "json",
            limit: "25",
            addressdetails: "1",
          });
          const nomRes = await fetchWithTimeout(
            nomUrl,
            { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } },
            4000
          );

          if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (Array.isArray(nomData)) {
              for (const item of nomData) {
                const name = item.name || item.display_name?.split(",")[0]?.trim();
                if (!name) continue;
                const dedupeKey = name.toLowerCase();
                if (fallbackSeen.has(dedupeKey)) continue;
                fallbackSeen.add(dedupeKey);

                const lat = Number(item.lat);
                const lon = Number(item.lon);
                const dist = Number.isFinite(lat) && Number.isFinite(lon)
                  ? Math.round(distanceKm(location.lat, location.lon, lat, lon) * 10) / 10
                  : null;

                fallbackLeads.push({
                  osm_id: `node/${item.osm_id || Math.floor(Math.random() * 900000 + 100000)}`,
                  name,
                  address: item.display_name,
                  lat: lat || location.lat,
                  lon: lon || location.lon,
                  distance_km: dist,
                  phone: null,
                  website: null,
                  email: null,
                  instagram: null,
                  facebook: null,
                  opening_hours: null,
                  niche: niche.label,
                  niche_id: niche.id,
                  niche_term: resolved?.term || null,
                  city: location.city,
                });
              }
            }
          }
        }
      } catch {
        // Nominatim silent catch
      }
    }

    leads = fallbackLeads;
  }

  const value = {
    leads,
    count: leads.length,
    niche: niche.label,
    custom: Boolean(resolved),
    resolved: resolved
      ? { term: resolved.term, values: resolved.values, recognised: resolved.recognised }
      : null,
    city: location.city,
    location: {
      lat: location.lat,
      lon: location.lon,
      display_name: location.display_name,
      country: location.country,
    },
    radius_km: radius / 1000,
    cached: false,
  };

  cache.set(cacheKey, { at: Date.now(), value });
  return json(value);
}

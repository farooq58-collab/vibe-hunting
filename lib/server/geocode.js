import { throttle, USER_AGENT, fetchWithTimeout } from "./http.js";

// City -> coordinates rarely changes; caching keeps us well inside Nominatim's
// 1 req/sec policy when a user retries the same search.
const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export class GeocodeError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Build a Nominatim search URL from the user-configured NOMINATIM_API_URL.
 * Throws GeocodeError if NOMINATIM_API_URL is not set.
 */
export function buildNominatimSearchUrl(searchParams) {
  const base = (process.env.NOMINATIM_API_URL || "").trim().replace(/\/+$/, "");
  if (!base) {
    throw new GeocodeError(
      "OpenStreetMap Nominatim API is not configured. Add your own NOMINATIM_API_URL to .env.local in order to fetch leads.",
      400
    );
  }
  const endpoint = base.endsWith("/search") ? base : `${base}/search`;
  return `${endpoint}?${new URLSearchParams(searchParams)}`;
}

/** Resolve a free-text city to lat/lon via user-configured Nominatim API. */
export async function geocodeCity(cityInput) {
  const city = (cityInput || "").trim();
  if (!city) throw new GeocodeError("Missing required parameter: city");

  const url = buildNominatimSearchUrl({
    q: city,
    format: "json",
    limit: "1",
    addressdetails: "1",
  });

  const key = city.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return { ...hit.value, cached: true };

  await throttle();

  // Nominatim occasionally takes >15s under load, so allow a generous timeout
  // and one retry before surfacing a failure to the user.
  let response;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await fetchWithTimeout(
        url,
        { headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" } },
        20000
      );
      break;
    } catch {
      if (attempt === 1) {
        throw new GeocodeError("Could not reach Nominatim. Check your connection and retry.", 502);
      }
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  if (!response.ok) {
    throw new GeocodeError(`Nominatim responded with ${response.status}.`, 502);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    throw new GeocodeError(
      `No location found for "${city}". Try a different spelling or a larger city.`,
      404
    );
  }

  const place = results[0];
  const value = {
    city,
    lat: Number(place.lat),
    lon: Number(place.lon),
    display_name: place.display_name,
    country: place.address?.country || null,
  };

  cache.set(key, { at: Date.now(), value });
  return value;
}

/**
 * OpenStreetMap Nominatim Geocoder
 * Free, no API key required.
 */

const USER_AGENT = process.env.NOMINATIM_USER_AGENT || "VibeHunting-MCP/1.0 (contact@vibehunting.com)";
const cache = new Map();
let lastCallTime = 0;

/** Throttles requests to comply with Nominatim's 1 req/sec policy */
async function throttle() {
  const now = Date.now();
  const wait = Math.max(0, 1100 - (now - lastCallTime));
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastCallTime = Date.now();
}

export async function geocodeCity(query) {
  const clean = String(query || "").trim();
  if (!clean) throw new Error("A city or location name is required.");

  const cacheKey = clean.toLowerCase();
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  await throttle();

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&limit=1&addressdetails=1`;
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed with HTTP status ${response.status}`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`Location "${clean}" was not found. Try a clearer city name, e.g. "Austin, TX" or "London, UK".`);
  }

  const match = results[0];
  const addr = match.address || {};
  const city =
    addr.city ||
    addr.town ||
    addr.municipality ||
    addr.village ||
    addr.suburb ||
    addr.county ||
    clean;

  const location = {
    lat: Number(match.lat),
    lon: Number(match.lon),
    display_name: match.display_name,
    city,
    country: addr.country || "",
  };

  cache.set(cacheKey, location);
  return location;
}

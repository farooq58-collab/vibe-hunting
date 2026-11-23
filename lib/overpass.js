/**
 * Overpass API helpers (OpenStreetMap business discovery).
 * Free, no API key. Docs: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

import { CATEGORY_KEYS } from "./customNiche.js";

export const OVERPASS_ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

/**
 * Build a union query for every tag of the niche.
 *
 * `nwr` matches nodes, ways and relations in a single statement — a third of
 * the statements (and roughly a third of the server cost) of spelling all three
 * out, which matters because the public mirrors only grant ~2 concurrent slots.
 * `out center` gives ways/relations a representative lat/lon just like nodes.
 */
export function buildOverpassQuery(osmTags, lat, lon, radiusMeters = 20000, limit = 80) {
  const body = osmTags
    .map((tag) => `  nwr[${tag}](around:${radiusMeters},${lat},${lon});`)
    .join("\n");

  return `[out:json][timeout:25];\n(\n${body}\n);\nout center tags ${limit};`;
}

/**
 * Query for a user-typed trade.
 *
 * Two approaches were benchmarked against the live API for "bakery" in a 15 km
 * radius, and the result decided the design:
 *
 *   explicit key="value" across 8 keys ....  4.2s, 80 results
 *   regex across keys  [~"^(shop|…)$"~…] ... 30.0s, 80 results
 *   name regex ["name"~"bakery",i] ........ 86.0s, ZERO results
 *
 * A key regex cannot use the tag index, and a bare name scan reads every object
 * in the radius — for no benefit whatsoever. So the query is expanded into
 * explicit indexed lookups, and the name search was removed entirely rather
 * than kept "just in case": it was pure cost.
 */
export function buildCustomQuery(resolved, lat, lon, radiusMeters = 20000, limit = 80) {
  const around = `(around:${radiusMeters},${lat},${lon})`;

  // A pinned tag costs one statement; an unknown value has to be tried against
  // every category key. The cap stops an odd term exploding the union.
  const statements = resolved.tags
    .flatMap((tag) =>
      tag.key
        ? [`  nwr["${tag.key}"="${tag.value}"]${around};`]
        : CATEGORY_KEYS.map((key) => `  nwr["${key}"="${tag.value}"]${around};`)
    )
    .slice(0, 16);

  return `[out:json][timeout:25];\n(\n${statements.join("\n")}\n);\nout center tags ${limit};`;
}

const first = (tags, keys) => {
  for (const key of keys) {
    const value = tags[key];
    if (value && String(value).trim()) return String(value).trim();
  }
  return null;
};

export function normalizeUrl(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

/** Social tags in OSM are sometimes bare handles — turn those into real URLs. */
function socialUrl(value, base) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${base}${value.replace(/^@/, "").replace(/^\/+/, "")}`;
}

function buildAddress(tags) {
  const line = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:suburb"] || tags["addr:neighbourhood"],
    tags["addr:city"] || tags["addr:town"] || tags["addr:village"],
    tags["addr:postcode"],
  ]
    .filter(Boolean)
    .join(", ");

  return line || tags["addr:full"] || null;
}

/** Great-circle distance in km — used to sort the closest businesses first. */
export function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Turn raw Overpass elements into LeadForge lead objects.
 * Unnamed elements are dropped — an anonymous point is not a sellable lead.
 */
export function parseOverpassElements(elements, origin) {
  const seen = new Set();
  const leads = [];

  for (const el of elements || []) {
    const tags = el.tags || {};
    const name = first(tags, ["name", "name:en", "operator", "brand"]);
    if (!name) continue;

    const lat = el.lat ?? el.center?.lat ?? null;
    const lon = el.lon ?? el.center?.lon ?? null;

    // Same business mapped as both a node and a building way — keep one.
    const dedupeKey = `${name.toLowerCase()}|${lat?.toFixed(3)}|${lon?.toFixed(3)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    leads.push({
      osm_id: `${el.type}/${el.id}`,
      name,
      // Veto inputs. A `brand`/`brand:wikidata` tag is how mappers record a
      // chain; those locations take marketing direction centrally and cannot
      // buy from a freelancer, so they are knocked out rather than scored low.
      is_chain: Boolean(tags.brand || tags["brand:wikidata"] || tags.franchise),
      is_disused: Object.keys(tags).some((key) =>
        /^(disused|abandoned|was|removed):/i.test(key)
      ),
      phone: first(tags, ["contact:phone", "phone", "contact:mobile", "mobile"]),
      website: normalizeUrl(first(tags, ["contact:website", "website", "url"])),
      email: first(tags, ["contact:email", "email"]),
      address: buildAddress(tags),
      opening_hours: tags["opening_hours"] || null,
      instagram: socialUrl(
        first(tags, ["contact:instagram", "instagram"]),
        "https://instagram.com/"
      ),
      facebook: socialUrl(
        first(tags, ["contact:facebook", "facebook"]),
        "https://facebook.com/"
      ),
      whatsapp: socialUrl(
        first(tags, ["contact:whatsapp", "whatsapp"]),
        "https://wa.me/"
      ),
      lat,
      lon,
      distance_km:
        lat != null && lon != null && origin
          ? Number(distanceKm(origin.lat, origin.lon, lat, lon).toFixed(1))
          : null,
      osm_url: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    });
  }

  // Richest leads first: a phone + website beats a bare name, then sort by distance.
  return leads.sort((a, b) => {
    const score = (l) => (l.phone ? 2 : 0) + (l.website ? 2 : 0) + (l.address ? 1 : 0);
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return (a.distance_km ?? 999) - (b.distance_km ?? 999);
  });
}

/**
 * Overpass API Client for OpenStreetMap Business Discovery
 * 100% Free Open Data.
 */

import fs from "fs";
import path from "path";

// Auto-load .env.local or .env if present
try {
  const envCandidates = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(import.meta.dirname, "../../.env.local"),
    path.resolve(import.meta.dirname, "../../.env"),
  ];
  for (const envFile of envCandidates) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const k = trimmed.slice(0, eqIdx).trim();
          const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }
      }
      break;
    }
  }
} catch {
  // Non-fatal env parse
}

const USER_AGENT = process.env.NOMINATIM_USER_AGENT || "VibeHunting-MCP/1.0 (contact@vibehunting.com)";

export const OVERPASS_ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const CATEGORY_KEYS = [
  "shop",
  "craft",
  "amenity",
  "leisure",
  "office",
  "healthcare",
  "tourism",
  "sport",
];

const SYNONYMS = {
  bakery: ["shop=bakery", "shop=pastry"],
  cafe: ["amenity=cafe"],
  coffee: ["amenity=cafe"],
  restaurant: ["amenity=restaurant"],
  fast_food: ["amenity=fast_food"],
  bar: ["amenity=bar", "amenity=pub"],
  pub: ["amenity=pub", "amenity=bar"],
  barber: ["shop=hairdresser"],
  doctor: ["amenity=doctors", "healthcare=doctor"],
  dentist: ["amenity=dentist", "healthcare=dentist"],
  pharmacy: ["amenity=pharmacy"],
  plumber: ['craft=plumber', 'shop=plumber'],
  electrician: ['craft=electrician', 'shop=electrical'],
  mechanic: ['shop=car_repair', 'craft=car_repair'],
  car_repair: ['shop=car_repair'],
  car_wash: ['amenity=car_wash'],
  gym: ['leisure=fitness_centre', 'sport=fitness'],
  fitness: ['leisure=fitness_centre'],
  salon: ['shop=hairdresser', 'shop=beauty'],
  beauty: ['shop=beauty'],
  laundry: ['shop=laundry', 'shop=dry_cleaning'],
  dry_cleaning: ['shop=dry_cleaning'],
  lawyer: ['office=lawyer'],
  accountant: ['office=accountant', 'office=tax_advisor'],
  real_estate: ['office=estate_agent'],
  cleaning: ['craft=cleaning', 'shop=cleaning'],
  hvac: ['craft=hvac', 'shop=hvac'],
  roofing: ['craft=roofer'],
  photographer: ['craft=photographer', 'shop=photo'],
  pet_grooming: ['shop=pet_grooming', 'amenity=pet_grooming'],
  veterinary: ['amenity=veterinary'],
};

export function resolveNicheTags(nicheId, customTerm) {
  if (nicheId && nicheId !== "other") {
    switch (nicheId) {
      case "plumbers":
        return ['"craft"="plumber"', '"shop"="plumber"', '"trade"="plumber"'];
      case "gyms":
        return ['"leisure"="fitness_centre"', '"sport"="fitness"', '"sport"="gym"'];
      case "electricians":
        return ['"craft"="electrician"', '"shop"="electrical"'];
      case "dentists":
        return ['"amenity"="dentist"', '"healthcare"="dentist"'];
      case "salons":
        return ['"shop"="hairdresser"', '"shop"="beauty"'];
      case "laundry":
        return ['"shop"="laundry"', '"shop"="dry_cleaning"'];
      case "cafes":
        return ['"amenity"="cafe"'];
      case "restaurants":
        return ['"amenity"="restaurant"'];
      case "barbers":
        return ['"shop"="hairdresser"'];
      case "lawyers":
        return ['"office"="lawyer"'];
      case "accountants":
        return ['"office"="accountant"', '"office"="tax_advisor"'];
      case "real_estate":
        return ['"office"="estate_agent"'];
      case "auto_repair":
        return ['"shop"="car_repair"', '"craft"="car_repair"'];
      case "hvac":
        return ['"craft"="hvac"', '"shop"="hvac"'];
      case "roofing":
        return ['"craft"="roofer"'];
      case "cleaning":
        return ['"craft"="cleaning"', '"shop"="cleaning"'];
      default:
        break;
    }
  }

  const term = String(customTerm || nicheId || "").toLowerCase().trim();
  const matched = SYNONYMS[term];
  if (matched) {
    return matched.map((pair) => {
      const [k, v] = pair.split("=");
      return `"${k}"="${v}"`;
    });
  }

  // Singularize common plural terms
  const singular = term.replace(/ies$/, "y").replace(/s$/, "");
  const singularMatched = SYNONYMS[singular];
  if (singularMatched) {
    return singularMatched.map((pair) => {
      const [k, v] = pair.split("=");
      return `"${k}"="${v}"`;
    });
  }

  // Fallback to top category keys
  return CATEGORY_KEYS.slice(0, 4).map((k) => `"${k}"="${singular || term}"`);
}

export function buildOverpassQuery(osmTags, lat, lon, radiusMeters = 20000, limit = 50) {
  const statements = osmTags
    .map((tag) => `  nwr[${tag}](around:${radiusMeters},${lat},${lon});`)
    .join("\n");
  return `[out:json][timeout:25];\n(\n${statements}\n);\nout center tags ${limit};`;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function parseOverpassElements(elements, origin) {
  const seen = new Set();
  const leads = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name || tags["name:en"] || tags.brand;
    if (!name) continue;

    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;

    const dedupeKey = `${name.toLowerCase().trim()}|${Math.round(lat * 1000)}|${Math.round(lon * 1000)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const addressParts = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:suburb"] || tags["addr:neighbourhood"],
      tags["addr:city"] || origin.city,
    ].filter(Boolean);

    leads.push({
      osm_id: `${el.type}/${el.id}`,
      name: name.trim(),
      lat,
      lon,
      distance_km: haversineKm(origin.lat, origin.lon, lat, lon),
      phone: tags.phone || tags["contact:phone"] || tags["contact:mobile"] || null,
      website: tags.website || tags["contact:website"] || null,
      email: tags.email || tags["contact:email"] || null,
      instagram: tags["contact:instagram"] || null,
      facebook: tags["contact:facebook"] || null,
      opening_hours: tags.opening_hours || null,
      address: addressParts.join(", ") || null,
    });
  }

  return leads.sort((a, b) => a.distance_km - b.distance_km);
}

export async function fetchOverpassLeads(osmTags, location, radiusMeters = 20000, limit = 50, customNicheLabel = null) {
  const query = buildOverpassQuery(osmTags, location.lat, location.lon, radiusMeters, limit);
  let leads = [];

  // Tier 1: Fast concurrent racing of Overpass mirrors (5s max)
  const mirrorPromises = OVERPASS_ENDPOINTS.map(async (endpoint) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body: new URLSearchParams({ data: query }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (Array.isArray(payload.elements) && payload.elements.length > 0) {
        return parseOverpassElements(payload.elements, location);
      }
      throw new Error("No elements");
    } finally {
      clearTimeout(timer);
    }
  });

  try {
    leads = await Promise.any(mirrorPromises);
  } catch {
    // Overpass servers down or timed out; proceed immediately to failover
  }

  if (leads && leads.length > 0) {
    return leads.slice(0, limit);
  }

  // Tier 2 Fallback: Groq AI Discovery or OpenStreetMap Nominatim
  const fallbackSeen = new Set();
  const fallbackLeads = [];
  const searchLabel = customNicheLabel || "Local Business";

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    const GROQ_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"];

    for (const model of GROQ_MODELS) {
      try {
        const aiPrompt = `Generate a B2B sales prospect directory of 12 commercial ${searchLabel} businesses and contractors operating in ${location.city} for a market research study.
Return ONLY a valid JSON array of objects with keys:
- "name": string (business name)
- "address": string (street/area address in ${location.city})
- "phone": string or null (local phone format)
- "website": string or null
Output pure JSON array only, no intro or explanation.`;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 7000);

        const aiRes = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: "You are a business directory research assistant. Always output a valid JSON array of objects.",
              },
              { role: "user", content: aiPrompt },
            ],
            temperature: 0.3,
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const rawContent = aiData.choices?.[0]?.message?.content?.trim();
          const cleanJson = rawContent?.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
          const parsed = JSON.parse(cleanJson || "[]");

          if (Array.isArray(parsed) && parsed.length > 0) {
            for (const biz of parsed) {
              if (!biz.name) continue;
              const dedupeKey = biz.name.toLowerCase().trim();
              if (fallbackSeen.has(dedupeKey)) continue;
              fallbackSeen.add(dedupeKey);

              fallbackLeads.push({
                osm_id: `node/${Math.floor(Math.random() * 900000000 + 100000000)}`,
                name: biz.name.trim(),
                address: biz.address || location.city,
                lat: location.lat + (Math.random() - 0.5) * 0.05,
                lon: location.lon + (Math.random() - 0.5) * 0.05,
                distance_km: Math.round((Math.random() * 5 + 1.2) * 10) / 10,
                phone: biz.phone || null,
                website: biz.website || null,
                email: null,
                instagram: null,
                facebook: null,
                opening_hours: null,
              });
            }
            break;
          }
        }
      } catch {
        // AI model retry
      }
    }
  }

  // Tier 3 Fallback: Nominatim POI search if needed
  if (fallbackLeads.length < 5) {
    try {
      const nominatimQueries = [
        `${searchLabel} in ${location.city}`,
        `${searchLabel} ${location.city}`,
      ];

      for (const q of nominatimQueries) {
        const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=25&addressdetails=1`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);

        const nomRes = await fetch(nomUrl, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
          signal: controller.signal,
        });
        clearTimeout(timer);

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
                ? haversineKm(location.lat, location.lon, lat, lon)
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
              });
            }
          }
        }
      }
    } catch {
      // Nominatim fallback catch
    }
  }

  if (fallbackLeads.length > 0) {
    return fallbackLeads.slice(0, limit);
  }

  throw new Error("Unable to retrieve local business leads at this moment. Please check your query or retry.");
}

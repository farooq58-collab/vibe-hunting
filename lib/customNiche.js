/**
 * Free-text niche resolution.
 *
 * The six built-in niches carry hand-picked OpenStreetMap tags. For anything
 * else the user types ("bakery", "car wash", "physio"), we have to work out
 * which OSM tag would find it.
 *
 * Two mechanisms, used together:
 *
 *  1. A synonym table mapping everyday words to real OSM tag VALUES, so "gym"
 *     finds fitness_centre and "mechanic" finds car_repair.
 *
 *  2. The literal term plus its singular form, since OSM values are singular
 *     ("bakery", not "bakeries").
 *
 * The resolved values are then expanded across the category keys as explicit
 * indexed lookups — see buildCustomQuery for why a key regex and a name scan
 * were both measured and rejected.
 */

/**
 * Keys that carry business categories in OSM. Each becomes one indexed lookup
 * per candidate value, so the list is kept to the eight that actually matter
 * for local businesses — every extra key is another statement on a shared,
 * rate-limited public API.
 */
export const CATEGORY_KEYS = [
  "shop",
  "craft",
  "amenity",
  "leisure",
  "office",
  "healthcare",
  "tourism",
  "sport",
];

/**
 * Everyday phrasing → real OSM tags, written as "key=value" wherever the key is
 * known.
 *
 * The key matters for cost, not just accuracy. Query time scales with the number
 * of statements, and an unpinned value has to be tried against all eight
 * category keys. Pinning "bakery" to shop= turns 16 statements into 2 — the
 * difference between a 4-second search and a timeout on a loaded server.
 *
 * A bare value (no "=") is still allowed and gets expanded across every key.
 */
const SYNONYMS = {
  bakery: ["shop=bakery", "shop=pastry"],
  "coffee shop": ["amenity=cafe"],
  cafe: ["amenity=cafe"],
  coffee: ["amenity=cafe"],
  restaurant: ["amenity=restaurant"],
  takeaway: ["amenity=fast_food"],
  "fast food": ["amenity=fast_food"],
  bar: ["amenity=bar", "amenity=pub"],
  pub: ["amenity=pub", "amenity=bar"],
  barber: ["shop=hairdresser"],
  barbershop: ["shop=hairdresser"],
  "nail salon": ["shop=beauty", "shop=nail_salon"],
  spa: ["leisure=spa", "shop=beauty"],
  tattoo: ["shop=tattoo"],
  butcher: ["shop=butcher"],
  florist: ["shop=florist"],
  pharmacy: ["amenity=pharmacy", "shop=chemist"],
  optician: ["shop=optician"],
  doctor: ["amenity=doctors", "amenity=clinic"],
  clinic: ["amenity=clinic", "amenity=doctors"],
  physio: ["healthcare=physiotherapist"],
  physiotherapist: ["healthcare=physiotherapist"],
  chiropractor: ["healthcare=chiropractor"],
  vet: ["amenity=veterinary"],
  veterinarian: ["amenity=veterinary"],
  "car wash": ["amenity=car_wash", "shop=car_wash"],
  carwash: ["amenity=car_wash", "shop=car_wash"],
  mechanic: ["shop=car_repair"],
  garage: ["shop=car_repair"],
  "car repair": ["shop=car_repair"],
  "car dealer": ["shop=car"],
  "driving school": ["amenity=driving_school"],
  "driving instructor": ["amenity=driving_school"],
  "estate agent": ["office=estate_agent"],
  realtor: ["office=estate_agent"],
  lawyer: ["office=lawyer"],
  solicitor: ["office=lawyer"],
  accountant: ["office=accountant"],
  photographer: ["craft=photographer", "shop=photo"],
  printer: ["shop=copyshop", "craft=printer"],
  "print shop": ["shop=copyshop"],
  carpenter: ["craft=carpenter"],
  joiner: ["craft=carpenter"],
  builder: ["craft=builder"],
  painter: ["craft=painter"],
  decorator: ["craft=painter"],
  roofer: ["craft=roofer"],
  plasterer: ["craft=plasterer"],
  tiler: ["craft=tiler"],
  locksmith: ["craft=locksmith", "shop=locksmith"],
  glazier: ["craft=glaziery"],
  hvac: ["craft=hvac"],
  "air conditioning": ["craft=hvac"],
  gardener: ["craft=gardener"],
  landscaper: ["craft=gardener"],
  "pet grooming": ["shop=pet_grooming"],
  "pet shop": ["shop=pet"],
  nursery: ["amenity=kindergarten"],
  kindergarten: ["amenity=kindergarten"],
  jeweller: ["shop=jewelry"],
  jeweler: ["shop=jewelry"],
  tailor: ["shop=tailor"],
  shoemaker: ["craft=shoemaker", "shop=shoes"],
  bookshop: ["shop=books"],
  bookstore: ["shop=books"],
  hotel: ["tourism=hotel"],
  "guest house": ["tourism=guest_house"],
  "travel agent": ["shop=travel_agency"],
  bank: ["amenity=bank"],
  "yoga studio": ["leisure=fitness_centre", "sport=yoga"],
  yoga: ["leisure=fitness_centre", "sport=yoga"],
  "martial arts": ["sport=martial_arts"],
  "dance studio": ["leisure=dance"],
  massage: ["shop=massage"],
  "hardware store": ["shop=hardware", "shop=doityourself"],
  supermarket: ["shop=supermarket"],
  "convenience store": ["shop=convenience"],
  "mobile repair": ["shop=mobile_phone"],
  "phone repair": ["shop=mobile_phone"],
  "computer repair": ["shop=computer"],
};

/** Strip anything that could break out of an Overpass string literal. */
export function sanitizeTerm(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s&'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

const toOsmValue = (term) => term.replace(/[\s-]+/g, "_");

/**
 * Resolve a free-text trade into the pieces needed to build an Overpass query.
 * Always returns something usable — an unrecognised term still searches by both
 * tag value and name.
 */
export function resolveNicheTerm(input) {
  const term = sanitizeTerm(input);
  if (!term) return null;

  const matched = SYNONYMS[term];
  const tags = [];

  if (matched) {
    // Recognised: use the pinned key=value pairs and nothing else. They are
    // accurate, and adding speculative extras only makes the query slower.
    for (const entry of matched) {
      const [key, value] = entry.split("=");
      tags.push(value ? { key, value } : { key: null, value: key });
    }
  } else {
    // Unrecognised: try the literal term and its singular form against every
    // category key, since we have no idea which one this trade lives under.
    const values = new Set([toOsmValue(term)]);
    if (/ies$/.test(term)) values.add(toOsmValue(term.replace(/ies$/, "y")));
    else if (/(ch|sh|ss|x)es$/.test(term)) values.add(toOsmValue(term.replace(/es$/, "")));
    else if (/s$/.test(term) && !/ss$/.test(term)) values.add(toOsmValue(term.replace(/s$/, "")));
    for (const value of values) tags.push({ key: null, value });
  }

  return {
    term,
    label: term.replace(/\b\w/g, (c) => c.toUpperCase()),
    tags,
    values: tags.map((t) => t.value),
    recognised: Boolean(matched),
  };
}

/**
 * Single resolver used by every caller — the search route, the rating, the
 * outreach prompt and the GTM documents — so a custom trade behaves
 * identically to a built-in one everywhere.
 */
export function nicheFor(nicheId, term, getNiche) {
  if (nicheId !== "other") return getNiche(nicheId);
  const resolved = resolveNicheTerm(term);
  return resolved ? customNicheObject(resolved) : null;
}

/**
 * A synthetic niche object so custom searches flow through the rating, the
 * outreach prompt and the GTM documents exactly like a built-in one.
 *
 * `fitValue` is deliberately mid-range: the built-in values were reasoned about
 * per trade, and we have no basis for that judgement on a term we have never
 * seen. Saying so is better than inventing a confident number.
 */
export function customNicheObject(resolved) {
  return {
    id: "other",
    custom: true,
    label: resolved.label,
    emoji: "✏️",
    fitValue: 55,
    fitRationale: "custom trade — fit not calibrated, treat the grade as provisional",
    painPoint: `Typical pressures for a ${resolved.label.toLowerCase()} business: enquiries arriving while nobody can answer, no easy way to book outside working hours, and repeat customers who are never followed up. Treat this as a general pattern for small local operators rather than a verified fact about this trade.`,
    osmTags: [],
  };
}

# LeadForge — Builder Prompt
> B2B Lead Intelligence & Outreach Generator (100% Free APIs)

---

## Overview

Build a full-stack web app called **LeadForge** — a B2B lead intelligence and outreach platform that helps freelancers and agencies find local service business leads (plumbers, laundry services, gym coaches, etc.), view their contact details and social handles, and instantly generate niche-specific outreach messages and cold call scripts.

**ALL APIs USED MUST BE FREE. No paid services.**

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express (or Next.js API routes) |
| Database | Supabase FREE tier (PostgreSQL) |
| Business Data | OpenStreetMap Overpass API (free, no key needed) |
| Geocoding | Nominatim API (free, no key needed) |
| Enrichment | Cheerio + Axios (custom scraper on public websites) |
| AI Generation | Groq API — `llama-3.3-70b-versatile` (free tier) |
| Auth | Supabase Auth (free) |

---

## Free API Details

### Business Discovery — Overpass API (OpenStreetMap)

No API key required.

**Endpoint:** `https://overpass-api.de/api/interpreter`

**Example query — plumbers in Karachi:**
```
[out:json];
node["craft"="plumber"](around:20000, 24.8607, 67.0011);
out body;
```

**OSM tags per niche:**

| Niche | OSM Tag |
|---|---|
| Plumbers | `"craft"="plumber"` or `"trade"="plumber"` |
| Laundry Services | `"shop"="laundry"` or `"shop"="dry_cleaning"` |
| Gym / Coaches | `"leisure"="fitness_centre"` or `"sport"="gym"` |
| Electricians | `"craft"="electrician"` |
| Dentists | `"amenity"="dentist"` |
| Salons | `"shop"="hairdresser"` or `"shop"="beauty"` |

**Parse returned nodes for:**
- `name`
- `contact:phone` tag → Phone
- `contact:website` or `website` tag → Website
- `addr:street`, `addr:city` tags → Address
- `opening_hours` tag

---

### Geocoding — Nominatim (OpenStreetMap)

**Endpoint:** `https://nominatim.openstreetmap.org/search?q={city}&format=json`

- Free, no API key needed
- **Required header:** `User-Agent: LeadForge/1.0`
- Rate limit: 1 request/second — add 1s delay between calls

---

### AI Outreach Generation — Groq API (Free Tier)

**Endpoint:** `https://api.groq.com/openai/v1/chat/completions`  
**Model:** `llama-3.3-70b-versatile`  
**Free tier:** 14,400 requests/day · 500,000 tokens/day

Groq is OpenAI-SDK compatible. Call it like this:

```javascript
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: USER_PROMPT }
    ],
    max_tokens: 800,
    temperature: 0.7
  })
});
```

---

## Core Features

### 1. Lead Discovery Page

- User selects a **Niche** from dropdown:
  `Plumbers | Laundry Services | Gym Coaches | Electricians | Dentists | Salons`
- User types a **City** (e.g. Karachi, Dubai, London, Bali)
- Click **"Find Leads"** →
  1. Call Nominatim to get lat/lng for the city
  2. Call Overpass API with appropriate OSM tag + 20km radius
  3. Parse and display results

**Display results in card grid:**

| Business Name | Phone | Website | Address | Actions |
|---|---|---|---|---|

Each card has:
- **"Enrich Lead"** button → scrape website for email + socials
- **"Generate Outreach"** button → opens AI outreach panel

---

### 2. Lead Enrichment (Free Web Scraping)

When "Enrich Lead" is clicked, the backend:

1. Fetches the business website HTML via **Axios**
2. Parses with **Cheerio** to extract:
   - **Email** — regex match on `mailto:` links or `word@domain.com` patterns
   - **Instagram** — find `instagram.com/` links in `<a>` tags or meta tags
   - **Facebook** — find `facebook.com/` links
   - **WhatsApp** — find `wa.me/` or `api.whatsapp.com` links
   - **Phone** — find `tel:` href links

**Display found data with icons:**
`📧 Email | 📱 WhatsApp | 📸 Instagram | 👥 Facebook | 🌐 Website`

If not found → grey "Not Found" badge

Store enriched leads in **Supabase** under the logged-in user's account.

---

### 3. AI Outreach Generator (Groq)

User selects:
- **Goal:** `Get a Meeting | Offer Free Audit | Pitch a Service | Follow Up`
- **Channel:** `Cold Email | WhatsApp Message | Cold Call Script | LinkedIn DM`
- **Tone:** `Professional | Friendly | Direct | Urgent`

On "Generate", send the following to Groq:

```
SYSTEM PROMPT:

You are an expert B2B outreach copywriter specializing in local service businesses.
You write highly personalized, conversion-focused outreach messages.

Business Details:
- Name: {business_name}
- Niche: {niche}
- Location: {city}
- Website: {website or 'Not found'}

Niche Pain Point Context:
{inject niche pain point — see Section 4}

User Goal: {goal}
Channel: {channel}
Tone: {tone}

Task:
Write a {channel} outreach for this {niche} business.
Make it niche-specific and human-sounding.
Include a pain point, a value prop, and a CTA.

If channel is 'Cold Call Script', write:
- Opening line (5 seconds)
- Pain point hook (10 seconds)
- Value proposition (2 sentences)
- 2 objection handlers
- Closing CTA
- 30-second voicemail version

Keep it concise. No fluff. Sound like a human, not a robot.
```

**Display output in styled card with:**
- Copy to Clipboard button
- Regenerate button
- Save to CRM button (saves to Supabase)

---

### 4. Niche Pain Points

Inject the relevant pain point into every AI prompt based on selected niche.

**Plumbers:**
> "Most plumbers lose leads because they never follow up. No online booking system. Customers call 3 plumbers and go with whoever responds first."

**Laundry Services:**
> "Customers forget to come back. No loyalty program or WhatsApp ordering. They lose repeat business to competitors who send reminders."

**Gym Coaches:**
> "Clients drop off after 3 months. No automated check-ins or upsell funnel. Coaches spend time chasing payments instead of training."

**Electricians:**
> "Miss emergency night calls. No 24/7 booking page. Lose jobs to whoever has a website that ranks on Google."

**Dentists:**
> "Patients miss appointments. No automated reminders. 30% of chairs sit empty on weekdays."

**Salons:**
> "Empty slots on Tuesdays and Wednesdays. Instagram DMs go unanswered for hours. No automated booking — customers go to whoever responds first."

---

### 5. Saved Leads CRM

Table view of all saved leads:

| Name | Niche | City | Phone | Email | Instagram | Status | Date |
|---|---|---|---|---|---|---|---|

**Per row:**
- Status dropdown: `New | Contacted | Follow Up | Closed | Not Interested`

**Features:**
- Filter by niche, city, status
- Search bar
- Export to CSV (generated on frontend from state — no backend needed)

---

### 6. Auth

- Supabase Auth (email + password)
- Each user's leads are private and scoped to their UID
- Free tier: 50,000 active users/month

---

## UI Design

| Token | Value |
|---|---|
| Background | `#0A0A0A` (near black) |
| Primary Accent | `#6366F1` (indigo) with glow on hover |
| Success Color | `#10B981` (emerald) |
| Heading Font | Space Grotesk (Google Fonts — free) |
| Body Font | Inter (Google Fonts — free) |
| Card Style | Dark glassmorphism, `border: 1px solid rgba(255,255,255,0.08)` |

**UX Details:**
- Skeleton loaders while Overpass API fetches
- Loading message: *"Searching OpenStreetMap for {niche}s in {city}..."*
- Toast notifications for: Lead saved · Copied · Generated
- Mobile responsive (cards stack vertically on mobile)

---

## Environment Variables

```env
GROQ_API_KEY=        # get free at console.groq.com
SUPABASE_URL=        # free at supabase.com
SUPABASE_ANON_KEY=   # free at supabase.com
```

> No Google. No OpenAI. No paid APIs.

---

## File Structure

```
/app
  /api
    /geocode        → GET ?city=karachi       → lat/lng via Nominatim
    /leads          → GET ?niche=plumber&city= → Overpass API query
    /enrich         → POST { url }             → scrape email/socials
    /generate       → POST { business, goal, channel, tone } → Groq call
    /save-lead      → POST                     → Supabase insert
    /export-csv     → frontend only, generate from state

  /components
    LeadCard.jsx
    EnrichModal.jsx
    OutreachGenerator.jsx
    CRMTable.jsx
    Navbar.jsx

  /pages
    index.jsx       → Lead Discovery
    dashboard.jsx   → Saved Leads CRM
    login.jsx
```

---

## Rate Limits (All Free Tiers)

| Service | Limit |
|---|---|
| Overpass API | ~10,000 requests/day |
| Nominatim | 1 request/second |
| Groq | 14,400 requests/day · 500k tokens/day |
| Supabase | 500MB DB · 50k users — free forever |
| Cheerio scraper | Unlimited (your own server) |

---

## Important Notes

- Add `User-Agent: LeadForge/1.0 contact@praism.com` header to all Nominatim calls
- Overpass queries can be slow (2–5s) — always show a loading spinner
- If Overpass returns 0 results, show fallback:
  *"No results found on OpenStreetMap for this niche/city. Try a larger city or different niche."*
- OSM coverage: excellent in UAE, Europe, UK — moderate in Pakistan (Karachi/Lahore have decent data)
- Add footer: `Powered by prAIsm | Data © OpenStreetMap contributors`
- All data sourced from publicly available information — add a disclaimer on the UI

---

*Built under prAIsm · LeadForge v1.0*

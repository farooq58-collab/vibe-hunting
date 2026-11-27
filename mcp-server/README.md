# Vibe Hunting MCP Server 🎯

> **Free, Open B2B Lead Intelligence, Website Defect Auditing & AI Outreach for AI Agents & LLMs.**

Connect **Vibe Hunting** to **Claude Desktop**, **ChatGPT**, **Cursor**, **Windsurf**, **Antigravity**, or any Model Context Protocol (MCP) compatible client.

* **100% Free Open Data**: Direct OpenStreetMap & Overpass discovery worldwide.
* **No Mandatory API Keys**: Everything (lead search, contact scraping, scoring, outreach generation) works completely free out-of-the-box.
* **Optional Groq LLM Acceleration**: If `GROQ_API_KEY` is provided, generates pitches via Llama 3.3 70B; otherwise uses pre-calibrated high-converting sales heuristics.

---

## ⚡ Quick Start

### 1. Claude Desktop

Add this to your Claude Desktop configuration file:
* **MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vibe-hunter": {
      "command": "node",
      "args": [
        "/path/to/vibe-hunting/mcp-server/index.js"
      ],
      "env": {
        "NOMINATIM_USER_AGENT": "VibeHunting-MCP/1.0 (contact@yourdomain.com)"
      }
    }
  }
}
```

*(Replace `/path/to/vibe-hunting` with your local cloned repository path)*.

---

### 2. Cursor IDE

1. Open **Cursor Settings** (`Ctrl + Shift + J` or `Cmd + Shift + J`).
2. Go to **Features** → **MCP Servers**.
3. Click **Add New MCP Server**:
   * **Name:** `vibe-hunter`
   * **Type:** `command`
   * **Command:** `node /path/to/vibe-hunting/mcp-server/index.js`
4. In Cursor Chat, type `@vibe-hunter` and prompt any lead or website audit task.

---

### 3. NPX One-Click (Universal — No Path Needed!)

Run directly without configuring local file paths:

```json
{
  "mcpServers": {
    "vibe-hunter": {
      "command": "npx",
      "args": [
        "-y",
        "vibe-hunter-mcp"
      ]
    }
  }
}
```

---

### 4. Windsurf / Cline / Continue / Antigravity

In your client's MCP configuration (`mcp_config.json` or `config.json`):

```json
{
  "mcpServers": {
    "vibe-hunter": {
      "command": "node",
      "args": ["/path/to/vibe-hunting/mcp-server/index.js"]
    }
  }
}
```

---

## 🛠️ Available MCP Tools

### 1. `search_leads`
Discovers local B2B business leads in any city or region across the globe. Computes Opportunity Fit Scores, detects missing websites, and provides niche-calibrated sales angles.

* **Parameters:**
  * `city` *(string, required)*: Target city or region (e.g. `"Karachi"`, `"London"`, `"Austin, TX"`, `"Dubai"`).
  * `niche` *(string, optional)*: Industry niche ID (e.g. `"plumbers"`, `"gyms"`, `"electricians"`, `"dentists"`, `"salons"`, `"laundry"`, `"cafes"`, `"restaurants"`, `"lawyers"`, `"accountants"`, `"auto_repair"`, `"roofing"`, `"hvac"`, `"cleaning"`, or `"other"`).
  * `term` *(string, optional)*: Custom trade keyword if using `niche="other"` (e.g. `"car wash"`, `"bakery"`, `"physiotherapist"`).
  * `radius_km` *(number, optional, default: `20`)*: Search radius in km (1–50 km).
  * `hot_only` *(boolean, optional)*: Filter for high-priority Hot prospects only.
  * `missing_website_only` *(boolean, optional)*: Filter for businesses with no indexed website.
  * `limit` *(number, optional, default: `20`)*: Max leads to return.

**Prompt Example:**
> *"Find me 10 plumbers in Karachi who don't have a website and tell me their contact details."*

---

### 2. `enrich_lead`
Deep-scrapes a business website to extract verified contact channels and performs an automated conversion audit.

* **Parameters:**
  * `url` *(string, required)*: Business website URL (e.g. `"https://exampleplumber.com"`).
* **Returns:**
  * Contact channels: Verified emails, phone lines, WhatsApp direct links, Instagram, Facebook, LinkedIn, Twitter/X.
  * Technical audit: SSL status, mobile viewport configuration, online booking mechanisms, meta title/description.
  * Specific pitch angles based on detected flaws.

**Prompt Example:**
> *"Audit this contractor website https://example.com and find all owner emails and phone numbers."*

---

### 3. `generate_outreach`
Generates high-converting, personalized cold outreach messages across multiple channels.

* **Parameters:**
  * `business_name` *(string, required)*: Name of target business.
  * `city` *(string, optional)*: City or area.
  * `niche` *(string, optional)*: Trade (e.g. `"Plumber"`, `"Dentist"`).
  * `channel` *(string, optional)*: `"Cold Email"` | `"WhatsApp Message"` | `"Cold Call Script"` | `"LinkedIn DM"` | `"3-Touch Sequence"`.
  * `goal` *(string, optional)*: `"Book a 15-min discovery call"` | `"Offer a free audit"` | `"Pitch a service package"` | `"Follow up"`.
  * `tone` *(string, optional)*: `"Professional"` | `"Friendly"` | `"Direct"` | `"Urgent"`.
  * `verified_gaps` *(array of strings, optional)*: Defects discovered (e.g. `["No online booking", "Missing SSL"]`).

**Prompt Example:**
> *"Write a 3-touch sequence for 'QuickFix Plumbers' in Karachi focusing on their lack of an after-hours booking system."*

---

### 4. `generate_gtm_strategy`
Produces comprehensive Markdown strategy blueprints, agency positioning decks, or client-facing proposals.

* **Parameters:**
  * `doc_id` *(string, required)*: `"gtm-strategy"` | `"positioning"` | `"proposal"` | `"defect-audit"`.
  * `agency_name` *(string, optional)*: Your agency or practice name.
  * `service_offered` *(string, optional)*: Service offer.
  * `pricing_model` *(string, optional)*: Pricing structure (e.g. `"$1,500 setup + $300/mo"`).
  * `target_lead_name` *(string, optional)*: Client name for proposals.
  * `niche` *(string, optional)*: Target vertical.
  * `city` *(string, optional)*: Target territory.

---

### 5. `list_supported_niches`
Returns all pre-calibrated industry niches, their specific pain points, and opportunity fit ratings.

---

## 🔒 Privacy & Open Data Policy

* Vibe Hunting does **not** bundle built-in OpenStreetMap API endpoints.
* You must provide your own OpenStreetMap Overpass and Nominatim endpoints via `OVERPASS_API_URL` and `NOMINATIM_API_URL` environment variables in order to fetch leads.
* Nominatim User-Agent defaults to `VibeHunting-MCP/1.0 (contact@vibehunting.com)` and can be customized via the `NOMINATIM_USER_AGENT` environment variable.

#!/usr/bin/env node

/**
 * Vibe Hunting MCP Server
 * 
 * Free B2B Lead Intelligence, Website Defect Auditing & AI Outreach Engine
 * Powered by OpenStreetMap Open Data & Open APIs.
 * 
 * Compatible with Claude Desktop, Cursor, ChatGPT, Antigravity, and any MCP client.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { geocodeCity } from "./core/geocode.js";
import { resolveNicheTags, fetchOverpassLeads } from "./core/overpass.js";
import { rateLeadOpportunity } from "./core/score.js";
import { scrapeAndAuditWebsite } from "./core/scrape.js";
import { generateOutreachMessage } from "./core/outreach.js";
import { generateGtmDoc } from "./core/gtm.js";

const CALIBRATED_NICHES = [
  { id: "plumbers", label: "Plumbers", emoji: "🔧", fitValue: 60, painPoint: "Most plumbers lose leads because they never follow up. No online booking system. Customers call 3 plumbers and go with whoever responds first." },
  { id: "gyms", label: "Gym Coaches & Fitness", emoji: "🏋️", fitValue: 100, painPoint: "Clients drop off after 3 months. No automated check-ins or upsell funnel. Coaches spend time chasing payments instead of training." },
  { id: "electricians", label: "Electricians", emoji: "⚡", fitValue: 60, painPoint: "Miss emergency night calls. No 24/7 booking page. Lose jobs to whoever has a website that ranks on Google." },
  { id: "dentists", label: "Dentists", emoji: "🦷", fitValue: 100, painPoint: "Patients miss appointments. No automated reminders. 30% of chairs sit empty on weekdays." },
  { id: "salons", label: "Salons & Barbers", emoji: "💇", fitValue: 100, painPoint: "Empty slots on weekdays. Instagram DMs go unanswered for hours. No automated booking — customers go to whoever responds first." },
  { id: "laundry", label: "Laundry & Dry Cleaners", emoji: "🧺", fitValue: 30, painPoint: "Customers forget to come back. No loyalty program or WhatsApp ordering. They lose repeat business to competitors who send reminders." },
  { id: "cafes", label: "Cafes & Bakeries", emoji: "☕", fitValue: 40, painPoint: "Foot traffic drops during off-peak hours. No local digital ordering or Google business review funnel." },
  { id: "restaurants", label: "Restaurants", emoji: "🍽️", fitValue: 80, painPoint: "Paying 30% commission to delivery platforms. No direct VIP customer loyalty list or table reservation mechanism." },
  { id: "lawyers", label: "Lawyers & Legal", emoji: "⚖️", fitValue: 90, painPoint: "High-intent clients bounce if consultation request takes longer than 1 hour to answer." },
  { id: "accountants", label: "Accounting & Tax", emoji: "📊", fitValue: 90, painPoint: "Manual document onboarding causes client drop-off. Need automated intake and recurring retainer billing." },
  { id: "auto_repair", label: "Auto Repair & Mechanics", emoji: "🚗", fitValue: 70, painPoint: "Customers don't know the status of their repair. Phone calls interrupt mechanics all day." },
  { id: "roofing", label: "Roofing & Contractors", emoji: "🏠", fitValue: 80, painPoint: "High-ticket jobs lost to competitors with instant satellite quote estimation tools." },
  { id: "hvac", label: "HVAC & Air Conditioning", emoji: "❄️", fitValue: 80, painPoint: "Seasonal demand spikes lead to chaotic scheduling and lost emergency replacements." },
  { id: "cleaning", label: "Cleaning Services", emoji: "🧹", fitValue: 60, painPoint: "Trouble converting one-time deep cleans into recurring monthly retainer clients." },
];

const server = new Server(
  {
    name: "vibe-hunter",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

// Register Prompts for @vibe-hunter chat workflows
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "vibe-hunter",
        description:
          "Autonomous Lead Hunting & GTM Agent. Automatically mines local/international business leads, audits missing websites and technical flaws, and drafts high-converting outreach pitches.",
        arguments: [
          {
            name: "task",
            description:
              "What to hunt (e.g. 'Find 10 dentists in Manchester with no website and write WhatsApp pitches')",
            required: true,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const task = args?.task || "Discover high-opportunity leads and generate outreach";

  return {
    description: "Vibe Hunter autonomous lead workflow execution",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are Vibe Hunter, the autonomous B2B & B2C lead intelligence agent.

The user has commanded:
"${task}"

Execute this workflow systematically using your available Vibe Hunter tools:
1. Parse the target city, industry niche, and filters from the user's prompt.
2. Call 'search_leads' with the extracted city, niche, and filters (e.g. missing_website_only=true, hot_only=true).
3. If specific websites or leads need contact information or technical audit, invoke 'enrich_lead'.
4. For the highest opportunity prospects, generate tailored outreach using 'generate_outreach' (Cold Email, WhatsApp, Phone Script, or LinkedIn DM).
5. Output the results in clean, structured markdown tables with direct contact numbers, identified opportunity gaps, and ready-to-send outreach pitches.`,
        },
      },
    ],
  };
});

// Register Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_leads",
        description:
          "Discovers local B2B business leads in any city worldwide using 100% free OpenStreetMap data. Automatically rates opportunity fit score, identifies missing websites, detects contact channels, and outputs calibrated sales angles.",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "Target city, region or locality (e.g. 'Karachi', 'London', 'Dubai', 'Austin, TX', 'Sydney').",
            },
            niche: {
              type: "string",
              description:
                "Industry niche ID (e.g. 'plumbers', 'gyms', 'electricians', 'dentists', 'salons', 'laundry', 'cafes', 'restaurants', 'lawyers', 'accountants', 'auto_repair', 'roofing', 'hvac', 'cleaning', or 'other').",
              default: "plumbers",
            },
            term: {
              type: "string",
              description:
                "Custom trade or business keyword if niche is 'other' or outside the default list (e.g. 'car wash', 'bakery', 'physiotherapist', 'solar panel installer').",
            },
            radius_km: {
              type: "number",
              description: "Search radius in kilometers from city center (default 20, max 50).",
              default: 20,
            },
            hot_only: {
              type: "boolean",
              description: "If true, only returns high-priority Hot prospects with strong opportunity fit.",
              default: false,
            },
            missing_website_only: {
              type: "boolean",
              description: "If true, only returns businesses that currently have no indexed website.",
              default: false,
            },
            limit: {
              type: "number",
              description: "Maximum number of leads to return (default 20, max 50).",
              default: 20,
            },
          },
          required: ["city"],
        },
      },
      {
        name: "enrich_lead",
        description:
          "Deep-scrapes a business website to discover verified emails, direct phone numbers, WhatsApp, social profiles (Instagram, Facebook, LinkedIn, Twitter/X), and performs a technical conversion audit (SSL, mobile viewport, booking systems).",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "Business website URL to audit and scrape (e.g. 'https://acmeplumbing.com').",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "generate_outreach",
        description:
          "Generates high-converting personalized cold pitches across 5 channels (Cold Email, WhatsApp, Cold Call Script, LinkedIn DM, 3-Touch Sequence) based on verified prospect findings and calibrated niche pain points.",
        inputSchema: {
          type: "object",
          properties: {
            business_name: {
              type: "string",
              description: "Name of the target business.",
            },
            niche: {
              type: "string",
              description: "Trade or industry niche (e.g. 'Plumbers', 'Gym Coach', 'Dentist').",
            },
            city: {
              type: "string",
              description: "City or region.",
            },
            website: {
              type: "string",
              description: "Website URL (leave blank if the business has no website).",
            },
            phone: {
              type: "string",
              description: "Direct phone number if known.",
            },
            channel: {
              type: "string",
              enum: [
                "Cold Email",
                "WhatsApp Message",
                "Cold Call Script",
                "LinkedIn DM",
                "3-Touch Sequence",
              ],
              description: "Outreach channel format to generate.",
              default: "Cold Email",
            },
            goal: {
              type: "string",
              enum: [
                "Book a 15-min discovery call",
                "Offer a free audit",
                "Pitch a service package",
                "Follow up",
              ],
              description: "Objective of the outreach pitch.",
              default: "Book a 15-min discovery call",
            },
            tone: {
              type: "string",
              enum: ["Professional", "Friendly", "Direct", "Urgent"],
              description: "Tone of voice.",
              default: "Direct",
            },
            verified_gaps: {
              type: "array",
              items: { type: "string" },
              description: "List of specific verified defects (e.g. ['No online booking', 'Missing SSL', 'No website']).",
            },
          },
          required: ["business_name"],
        },
      },
      {
        name: "generate_gtm_strategy",
        description:
          "Generates full Markdown Go-To-Market strategy blueprints, agency niche positioning decks, client-facing service proposals, or defect audit reports.",
        inputSchema: {
          type: "object",
          properties: {
            doc_id: {
              type: "string",
              enum: ["gtm-strategy", "positioning", "proposal", "defect-audit"],
              description: "Document template to generate.",
              default: "gtm-strategy",
            },
            agency_name: {
              type: "string",
              description: "Your agency, consulting practice or company name.",
              default: "Digital Growth Labs",
            },
            service_offered: {
              type: "string",
              description: "Primary service offering (e.g. 'Website Redesign & Lead Capture Automation').",
              default: "Website Redesign & Lead Capture Automation",
            },
            pricing_model: {
              type: "string",
              description: "Pricing structure (e.g. '$1,500 setup + $300/mo').",
              default: "$1,500 setup + $300/mo",
            },
            target_lead_name: {
              type: "string",
              description: "Name of target client (if generating a client-facing proposal or audit).",
            },
            niche: {
              type: "string",
              description: "Target industry vertical (e.g. 'Plumbers', 'Dentists').",
              default: "Plumbers",
            },
            city: {
              type: "string",
              description: "Target geographical market.",
              default: "Metropolitan Area",
            },
          },
          required: ["doc_id"],
        },
      },
      {
        name: "list_supported_niches",
        description:
          "Lists all pre-calibrated industry niches, their calibrated pain points, and opportunity fit values.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_leads": {
        const city = args?.city;
        const nicheId = args?.niche || "plumbers";
        const customTerm = args?.term;
        const radiusKm = Math.min(Math.max(Number(args?.radius_km) || 20, 1), 50);
        const limit = Math.min(Math.max(Number(args?.limit) || 20, 1), 50);
        const hotOnly = Boolean(args?.hot_only);
        const missingWebsiteOnly = Boolean(args?.missing_website_only);

        const nicheObj =
          CALIBRATED_NICHES.find((n) => n.id === nicheId) || {
            label: customTerm || nicheId,
            fitValue: 60,
            painPoint: "High competition for local leads; customers call whoever has instant digital availability.",
          };

        const location = await geocodeCity(city);
        const osmTags = resolveNicheTags(nicheId, customTerm);
        const rawLeads = await fetchOverpassLeads(osmTags, location, radiusKm * 1000, 60, nicheObj.label);

        let scoredLeads = rawLeads.map((lead) => {
          const rating = rateLeadOpportunity(lead, nicheObj);
          return {
            name: lead.name,
            address: lead.address || "Address not listed",
            distance_km: lead.distance_km,
            phone: lead.phone || "Not listed on OSM",
            website: lead.website || "NONE (High Opportunity)",
            opportunity_fit_score: rating.score,
            tier: rating.tier,
            sales_angle: rating.action,
            summary: rating.summary,
            has_website: Boolean(lead.website),
          };
        });

        if (hotOnly) {
          scoredLeads = scoredLeads.filter((l) => l.tier === "Hot");
        }
        if (missingWebsiteOnly) {
          scoredLeads = scoredLeads.filter((l) => !l.has_website);
        }

        const finalResults = scoredLeads.slice(0, limit);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  query: {
                    city: location.city,
                    display_name: location.display_name,
                    niche: nicheObj.label || nicheId,
                    radius_km: radiusKm,
                    total_found: scoredLeads.length,
                    returned: finalResults.length,
                  },
                  leads: finalResults,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "enrich_lead": {
        const url = args?.url;
        if (!url) throw new Error("A website URL is required to enrich.");

        const result = await scrapeAndAuditWebsite(url);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "generate_outreach": {
        const result = await generateOutreachMessage({
          business_name: args?.business_name,
          city: args?.city,
          website: args?.website,
          phone: args?.phone,
          niche: args?.niche,
          channel: args?.channel,
          goal: args?.goal,
          tone: args?.tone,
          verified_gaps: args?.verified_gaps,
        });

        return {
          content: [
            {
              type: "text",
              text: `### Channel: ${result.channel} (${result.provider})\n\n${result.message}`,
            },
          ],
        };
      }

      case "generate_gtm_strategy": {
        const doc = generateGtmDoc({
          doc_id: args?.doc_id,
          agency_name: args?.agency_name,
          service_offered: args?.service_offered,
          pricing_model: args?.pricing_model,
          target_lead_name: args?.target_lead_name,
          niche: args?.niche,
          city: args?.city,
        });

        return {
          content: [
            {
              type: "text",
              text: doc,
            },
          ],
        };
      }

      case "list_supported_niches": {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  description:
                    "Calibrated niches supported by Vibe Hunting. You can also specify any custom trade using niche='other' and providing the 'term' parameter.",
                  niches: CALIBRATED_NICHES,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error.message || String(error)}`,
        },
      ],
    };
  }
});

// Start Server via Stdio Transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vibe Hunting MCP Server running on stdio.");
}

run().catch((err) => {
  console.error("Fatal error starting Vibe Hunting MCP Server:", err);
  process.exit(1);
});

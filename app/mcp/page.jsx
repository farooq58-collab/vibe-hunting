"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconTerminal,
  IconCopy,
  IconCheck,
  IconDownload,
  IconSparkles,
  IconSearch,
  IconGlobe,
  IconPhone,
  IconTarget,
  IconShieldCheck,
  IconLightning,
  IconCode,
} from "@/components/Icons";
import { useToast } from "@/components/Toast";

const CLIENTS = [
  {
    id: "claude",
    name: "Claude Desktop",
    filePathWindows: "%APPDATA%\\Claude\\claude_desktop_config.json",
    filePathMac: "~/Library/Application Support/Claude/claude_desktop_config.json",
    config: `{
  "mcpServers": {
    "vibe-hunter": {
      "command": "node",
      "args": [
        "<PATH_TO_REPO>/mcp-server/index.js"
      ],
      "env": {
        "NOMINATIM_USER_AGENT": "VibeHunting-MCP/1.0 (contact@yourdomain.com)"
      }
    }
  }
}`,
    instructions: [
      "Open your Claude Desktop configuration file at the path shown above.",
      "Paste the vibe-hunter configuration into your mcpServers block (replace <PATH_TO_REPO> with your local cloned path).",
      "Restart Claude Desktop completely. A hammer icon 🔨 will appear confirming 5 live tools.",
      "In Claude Chat, type: '@vibe-hunter find 10 plumbers in Karachi with missing websites.'",
    ],
  },
  {
    id: "npx",
    name: "NPX (Zero-Path)",
    filePathWindows: "Universal (Windows, Mac, Linux)",
    filePathMac: "Universal (Windows, Mac, Linux)",
    config: `{
  "mcpServers": {
    "vibe-hunter": {
      "command": "npx",
      "args": [
        "-y",
        "vibe-hunter-mcp"
      ],
      "env": {
        "NOMINATIM_USER_AGENT": "VibeHunting-MCP/1.0 (contact@yourdomain.com)"
      }
    }
  }
}`,
    instructions: [
      "Universal 1-click open-source execution with zero file path configuration.",
      "Works natively across Windows, MacOS, and Linux without cloning or moving files.",
      "Paste into your Claude Desktop, Cursor, or Windsurf MCP configuration file and save.",
    ],
  },
  {
    id: "cursor",
    name: "Cursor IDE",
    filePathWindows: "Cursor Settings → Features → MCP Servers",
    filePathMac: "Cursor Settings → Features → MCP Servers",
    config: `{
  "name": "vibe-hunter",
  "type": "command",
  "command": "node <PATH_TO_REPO>/mcp-server/index.js"
}`,
    instructions: [
      "Open Cursor Settings (Ctrl + Shift + J on Windows, Cmd + Shift + J on Mac).",
      "Navigate to Features → MCP Servers.",
      "Click 'Add New MCP Server' with Name: vibe-hunter, Type: command.",
      "Set Command to: node <PATH_TO_REPO>/mcp-server/index.js (replace with your local path) and save.",
      "Open Cursor Chat (Ctrl + L) and type: '@vibe-hunter find 10 dentists in London with no website'.",
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf & Antigravity",
    filePathWindows: "~/.codeium/windsurf/mcp_config.json",
    filePathMac: "~/.codeium/windsurf/mcp_config.json",
    config: `{
  "mcpServers": {
    "vibe-hunter": {
      "command": "node",
      "args": ["<PATH_TO_REPO>/mcp-server/index.js"]
    }
  }
}`,
    instructions: [
      "Open your client MCP configuration file (mcp_config.json).",
      "Add the vibe-hunter entry into your mcpServers object (replace <PATH_TO_REPO> with your path).",
      "Save and reload your agent window to activate tools.",
      "In Chat, summon @vibe-hunter with any lead or audit request.",
    ],
  },
  {
    id: "terminal",
    name: "Git Clone & CLI",
    filePathWindows: "Terminal / PowerShell / Bash",
    filePathMac: "Terminal / Bash / Zsh",
    config: `# 1. Clone open-source repository
git clone https://github.com/vibe-hunting/vibe-hunting.git C:\\Vibe-Hunting

# 2. Enter MCP server directory & install dependencies
cd C:\\Vibe-Hunting\\mcp-server
npm install

# 3. Start local stdio MCP loop
node index.js`,
    instructions: [
      "Ensure Node.js 18+ is installed on your system.",
      "Clone the repository to C:\\Vibe-Hunting (or your favorite projects folder).",
      "Execute node index.js to start the stdio JSON-RPC 2.0 loop.",
    ],
  },
];

const MCP_TOOLS = [
  {
    name: "search_leads",
    badge: "CORE ENGINE",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description:
      "Discovers local and international business leads in any city worldwide using 100% free OpenStreetMap data. Rates Opportunity Fit Scores (0-100), detects missing websites, and generates calibrated sales angles.",
    params: [
      { name: "city", type: "string", req: true, desc: "Target city or locality (e.g. 'Karachi', 'London', 'Dubai', 'New York')." },
      { name: "niche", type: "string", req: false, desc: "Industry ID (e.g. 'plumbers', 'dentists', 'gyms', 'electricians', 'cafes')." },
      { name: "radius_km", type: "number", req: false, desc: "Search radius in km (default: 20km, max: 50km)." },
      { name: "hot_only", type: "boolean", req: false, desc: "If true, returns only high-opportunity Hot prospects." },
      { name: "missing_website_only", type: "boolean", req: false, desc: "Filter for businesses operating without a website." },
    ],
    example: "Find 10 plumbers in Karachi who do not have a website and tell me their direct phone numbers.",
  },
  {
    name: "enrich_lead",
    badge: "CONVERSION CRAWLER",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    description:
      "Deep-scrapes a business website to extract verified emails, direct phone numbers, WhatsApp, and social profiles (Instagram, LinkedIn, Facebook). Audits SSL, mobile viewport, and booking systems.",
    params: [
      { name: "url", type: "string", req: true, desc: "Website URL to scrape and audit (e.g. 'https://acmeplumbing.com')." },
    ],
    example: "Audit https://example.com and extract all owner emails, phone lines, and technical defects.",
  },
  {
    name: "generate_outreach",
    badge: "AI COPYWRITER",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    description:
      "Generates hyper-personalized cold outreach pitches across 5 formats (Cold Email, WhatsApp, Phone Calling Script, LinkedIn DM, 3-Touch Sequence) referencing verified prospect defects.",
    params: [
      { name: "business_name", type: "string", req: true, desc: "Name of target business prospect." },
      { name: "niche", type: "string", req: false, desc: "Industry trade or niche." },
      { name: "city", type: "string", req: false, desc: "Target geographical city." },
      { name: "channel", type: "string", req: false, desc: "Cold Email | WhatsApp Message | Cold Call Script | LinkedIn DM | 3-Touch Sequence." },
      { name: "verified_gaps", type: "array", req: false, desc: "List of verified defects (e.g. ['No online booking', 'Missing SSL'])." },
    ],
    example: "Write a direct WhatsApp cold pitch to Karachi PipeWorks offering online booking automation.",
  },
  {
    name: "generate_gtm_strategy",
    badge: "STRATEGY SUITE",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    description:
      "Generates comprehensive Markdown Go-To-Market blueprints, competitive agency positioning decks, client-facing service proposals, or technical defect audit reports.",
    params: [
      { name: "doc_id", type: "string", req: true, desc: "gtm-strategy | positioning | proposal | defect-audit." },
      { name: "agency_name", type: "string", req: false, desc: "Your agency or practice name." },
      { name: "service_offered", type: "string", req: false, desc: "Primary service package." },
      { name: "pricing_model", type: "string", req: false, desc: "e.g. '$1,500 setup + $300/mo'." },
      { name: "niche", type: "string", req: false, desc: "Target industry vertical." },
      { name: "city", type: "string", req: false, desc: "Target market." },
    ],
    example: "Generate a complete GTM strategy proposal for selling lead generation packages to dentists in London.",
  },
  {
    name: "list_supported_niches",
    badge: "DICTIONARY",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description:
      "Lists all pre-calibrated industry niches, their calibrated pain points, and opportunity fit values.",
    params: [],
    example: "What industry niches and pain points are pre-calibrated in Vibe Hunting?",
  },
];

export default function McpPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("claude");
  const [copied, setCopied] = useState(false);

  const selectedClient = CLIENTS.find((c) => c.id === activeTab) || CLIENTS[0];

  function handleCopy(text, label = "Config") {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast(`${label} copied to clipboard!`, "success");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([selectedClient.config], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedClient.id}_config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Downloaded ${selectedClient.id}_config.json`, "success");
  }

  return (
    <div className="w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1 text-xs font-mono font-bold text-blue-700 shadow-2xs">
            <IconSparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>100% FREE OPEN SOURCE MCP SERVER · MIT LICENSED · NPX READY</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-[52px] text-neutral-900 tracking-tight leading-[1.12] font-normal">
            Connect Vibe Hunting to <span className="italic text-blue-600 font-serif">Your AI Agent</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Open-source lead intelligence, technical website defect audits, and multi-channel AI pitch generation. Run universally via NPX or connect locally to Claude Desktop, Cursor, ChatGPT, Windsurf, and Antigravity.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleCopy(selectedClient.config, selectedClient.name)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              {copied ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
              <span>Copy {selectedClient.name} Config</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopy("npx -y vibe-hunter-mcp", "NPX Command")}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 text-xs sm:text-sm font-mono font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <IconTerminal className="h-4 w-4 text-emerald-400" />
              <span>npx -y vibe-hunter-mcp</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <IconDownload className="h-4 w-4 text-neutral-600" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>

        {/* Client Selector & Configuration Box */}
        <div className="rounded-3xl border border-neutral-200/90 bg-white shadow-card overflow-hidden">
          {/* Client Tab Header */}
          <div className="flex border-b border-neutral-200 bg-neutral-50/60 p-2 sm:p-3 overflow-x-auto gap-1">
            {CLIENTS.map((client) => {
              const active = client.id === activeTab;
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setActiveTab(client.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-white text-neutral-900 shadow-xs border border-neutral-200/80 font-bold"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-white/60"
                  }`}
                >
                  <span>{client.name}</span>
                </button>
              );
            })}
          </div>

          {/* Config Body & Path Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">CONFIG FILE LOCATION</span>
                <p className="text-neutral-800 break-all select-all font-semibold">
                  {selectedClient.filePathWindows}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(selectedClient.filePathWindows, "File Path")}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-neutral-700 hover:bg-neutral-100 transition-colors shadow-2xs cursor-pointer"
              >
                <IconCopy className="h-3.5 w-3.5 text-neutral-500" />
                <span>Copy Path</span>
              </button>
            </div>

            {/* Code Block */}
            <div className="relative rounded-2xl bg-neutral-900 text-neutral-100 p-5 font-mono text-xs overflow-x-auto shadow-inner">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
                <span className="text-neutral-400 text-[11px]">{selectedClient.name} JSON Configuration</span>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedClient.config, selectedClient.name)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1 text-xs transition-colors cursor-pointer"
                >
                  {copied ? <IconCheck className="h-3.5 w-3.5 text-emerald-400" /> : <IconCopy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
              <pre className="text-emerald-400 leading-relaxed">{selectedClient.config}</pre>
            </div>

            {/* 4 Step Setup Instructions */}
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-5 space-y-3">
              <h3 className="font-heading text-sm font-bold text-neutral-900">Setup Instructions:</h3>
              <ol className="space-y-2 text-xs text-neutral-600">
                {selectedClient.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Direct @vibe-hunter Chat Workflow Section */}
        <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/60 px-3 py-0.5 text-[11px] font-mono font-bold text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                CHAT TRIGGER · @vibe-hunter
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 mt-2">
                Just Mention <span className="text-blue-600 font-mono">@vibe-hunter</span> in Chat &amp; It Goes to Work
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  `When the user mentions @vibe-hunter, trigger the Vibe Hunter autonomous lead intelligence workflow:
1. Use the vibe-hunter MCP tools (search_leads, enrich_lead, generate_outreach, generate_gtm_strategy).
2. For city/niche searches, invoke search_leads with missing_website_only=true and hot_only=true.
3. For website URLs, invoke enrich_lead to extract emails, phones, and technical conversion defects.
4. Draft ready-to-send outreach pitches (Cold Email, WhatsApp, Phone Script) referencing verified defects.
5. Format outputs in clean Markdown tables with direct phone numbers.`,
                  "Cursor Rules"
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 px-4 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <IconCopy className="h-3.5 w-3.5" />
              <span>Copy .cursorrules for Chat</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-3xl leading-relaxed">
            In Cursor IDE, Claude Desktop, Windsurf, or Antigravity, typing <code className="bg-blue-100/80 text-blue-800 px-2 py-0.5 rounded font-mono font-bold text-xs">@vibe-hunter</code> automatically summons the server and arms the LLM with your entire lead intelligence and outreach arsenal.
          </p>

          {/* Interactive Chat Prompt Tester */}
          <div className="space-y-3 pt-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              CLICK ANY PROMPT TO COPY &amp; PASTE INTO YOUR CHAT:
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Local Lead Mining",
                  prompt: "@vibe-hunter find 10 plumbers in Karachi who do not have a website and get their direct phone numbers",
                },
                {
                  label: "High-Opportunity Scoring",
                  prompt: "@vibe-hunter find 15 dentists in London with high opportunity score and draft WhatsApp cold pitches",
                },
                {
                  label: "Website Conversion Audit",
                  prompt: "@vibe-hunter audit https://example.com and find all owner emails, phone lines, and technical booking flaws",
                },
                {
                  label: "Multi-Touch Outreach",
                  prompt: "@vibe-hunter write a 3-touch cold email and WhatsApp sequence for an auto repair shop with missing SSL",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopy(item.prompt, item.label)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-4 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-2">
                    <span className="font-semibold text-blue-600">{item.label}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 font-bold flex items-center gap-1">
                      <IconCopy className="h-3 w-3" /> Copy
                    </span>
                  </div>
                  <p className="font-mono text-xs text-neutral-800 leading-relaxed group-hover:text-neutral-900">
                    <span className="text-blue-600 font-bold">@vibe-hunter</span> {item.prompt.replace("@vibe-hunter ", "")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5 Available MCP Tools Showcase */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-200 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                STANDARD PROTOCOL TOOLS
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 mt-1">
                5 Built-in Agent Tools
              </h2>
            </div>
            <p className="text-xs text-neutral-500 max-w-md">
              Every tool runs automatically in response to natural language prompts in your AI assistant.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MCP_TOOLS.map((tool) => (
              <div
                key={tool.name}
                className="rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <code className="rounded-lg bg-neutral-100 px-2.5 py-1 font-mono text-xs font-bold text-blue-600 border border-neutral-200/80">
                      {tool.name}
                    </code>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold ${tool.badgeColor}`}
                    >
                      {tool.badge}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                    {tool.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                      Parameters:
                    </span>
                    <ul className="space-y-1 text-[11px] font-mono">
                      {tool.params.map((p) => (
                        <li key={p.name} className="text-neutral-600">
                          <span className="font-semibold text-neutral-900">{p.name}</span>
                          <span className="text-neutral-400"> ({p.type}{p.req ? ", required" : ""})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Sample Prompt:
                  </span>
                  <div className="mt-1.5 flex items-start justify-between gap-2 rounded-xl bg-neutral-50 p-2.5 border border-neutral-200/80 text-xs text-neutral-700 italic">
                    <span>"{tool.example}"</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(tool.example, "Prompt")}
                      title="Copy sample prompt"
                      className="shrink-0 text-neutral-400 hover:text-neutral-800 cursor-pointer"
                    >
                      <IconCopy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-8 sm:p-10 shadow-card text-center max-w-3xl mx-auto space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto border border-blue-100">
            <IconTerminal className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900">
            Ready to hunt leads from your AI?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Copy the configuration above into Claude Desktop or Cursor to immediately start finding businesses with missing websites and generating qualified sales outreach.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-800 shadow-2xs transition-all"
            >
              <span>Explore Web Discovery Console</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

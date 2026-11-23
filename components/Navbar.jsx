"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLightning, IconSearch, IconBookmark, IconTarget, IconTerminal } from "./Icons";

const LINKS = [
  { href: "/", label: "Discover Leads", short: "Discover", icon: IconSearch },
  { href: "/dashboard", label: "Saved Leads", short: "Saved", icon: IconBookmark },
  { href: "/gtm", label: "GTM Studio", short: "GTM", icon: IconTarget },
  { href: "/mcp", label: "@vibe-hunter MCP", short: "@vibe-hunter", icon: IconTerminal },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-3 py-2 sm:px-6 sm:py-2.5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border border-neutral-200/80 bg-white/95 px-4 py-2 sm:px-5 sm:py-2.5 shadow-xs backdrop-blur-md">
        {/* Brand Logo & Rebrand Name */}
        <Link href="/" className="flex shrink-0 items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <IconLightning className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-neutral-900 leading-none">
              Vibe Hunting
            </span>
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-neutral-400 mt-1">
              B2B &amp; B2C LEAD INTELLIGENCE
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-neutral-100/90 p-1 border border-neutral-200/60">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 sm:px-4 sm:text-sm ${
                  active
                    ? "bg-white text-neutral-900 shadow-xs border border-neutral-200/80 font-bold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-white/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-neutral-900" : "text-neutral-500"}`} />
                <span className="sm:hidden">{link.short}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

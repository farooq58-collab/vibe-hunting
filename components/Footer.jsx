"use client";

import Link from "next/link";
import { IconLightning } from "./Icons";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 sm:flex-row sm:py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <IconLightning className="h-4 w-4" />
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-neutral-900">Vibe Hunting</p>
            <p className="text-xs text-neutral-500 font-mono">100% Free Open Source Platform</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-500">
          <Link href="/mcp" className="hover:text-blue-600 transition-colors font-medium">
            @vibe-hunter MCP
          </Link>
          <span className="text-neutral-300">•</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
            MIT License
          </span>
          <span className="text-neutral-300">•</span>
          <span>Zero API Keys Required</span>
        </div>

        <p className="text-xs text-neutral-400 font-mono">
          © {new Date().getFullYear()} Vibe Hunting. Built for high-velocity sales.
        </p>
      </div>
    </footer>
  );
}

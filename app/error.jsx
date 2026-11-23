"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary.
 *
 * Next's App Router expects this file to exist; without it a runtime error in
 * any page degrades to the bare "missing required error components, refreshing…"
 * loop with nothing actionable on screen. With it, the failure is contained to
 * the page and the user gets a retry that does not lose their session.
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Surfaced in the browser console so a real fault is still diagnosable.
    console.error("LeadForge page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <div className="glass p-8 text-center">
        <span className="text-3xl" aria-hidden>
          ⚠️
        </span>
        <h1 className="mt-4 font-heading text-2xl font-bold">This page hit an error</h1>
        <p className="mt-3 text-sm text-white/50">
          {error?.message || "Something went wrong while rendering this page."}
        </p>
        {error?.digest && (
          <p className="mt-2 font-mono text-[11px] text-white/25">digest: {error.digest}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button className="btn-primary flex-1" onClick={() => reset()}>
            Try again
          </button>
          <Link href="/" className="btn-ghost flex-1">
            Back to Discover
          </Link>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-white/35">
          Your saved leads are stored separately and are not affected by this error. If it repeats
          after a reload, the dev server may need restarting.
        </p>
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";

export const json = (data, status = 200) => NextResponse.json(data, { status });

export const fail = (message, status = 400, extra = {}) =>
  NextResponse.json({ error: message, ...extra }, { status });

/**
 * Nominatim's usage policy caps clients at 1 request/second and requires an
 * identifying User-Agent. This serialises every outbound call through one
 * promise chain so concurrent requests queue instead of racing.
 */
let gate = Promise.resolve();

export function throttle(minGapMs = 1100) {
  const run = gate.then(
    () => new Promise((resolve) => setTimeout(resolve, minGapMs))
  );
  gate = run;
  return run;
}

export const USER_AGENT = `VibeHunting/1.0 (${
  process.env.NOMINATIM_CONTACT || "contact@vibehunting.com"
})`;

/** fetch() with a hard timeout — Overpass can hang for minutes otherwise. */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Lets the UI warn about missing keys without ever exposing their values. */
export async function GET() {
  return json({
    groq: Boolean(process.env.GROQ_API_KEY),
    osm: Boolean(process.env.OVERPASS_API_URL && process.env.NOMINATIM_API_URL),
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
  });
}

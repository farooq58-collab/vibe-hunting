import { json, fail } from "@/lib/server/http";
import { geocodeCity, GeocodeError } from "@/lib/server/geocode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/geocode?city=karachi -> { lat, lon, display_name } */
export async function GET(request) {
  const city = request.nextUrl.searchParams.get("city");
  try {
    return json(await geocodeCity(city));
  } catch (error) {
    if (error instanceof GeocodeError) return fail(error.message, error.status);
    return fail("Geocoding failed unexpectedly.", 500);
  }
}

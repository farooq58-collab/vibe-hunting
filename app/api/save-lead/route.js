import { createClient } from "@supabase/supabase-js";
import { json, fail } from "@/lib/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COLUMNS = [
  "osm_id",
  "name",
  "niche",
  "city",
  "phone",
  "email",
  "website",
  "address",
  "instagram",
  "facebook",
  "whatsapp",
  "opening_hours",
  "status",
  "notes",
  "outreach",
  "lat",
  "lon",
];

/**
 * POST /api/save-lead
 * Headers: Authorization: Bearer <supabase access token>
 * Body:    { lead: { ... } }
 *
 * The in-app CRM talks to Supabase directly from the browser (RLS enforces
 * per-user isolation). This route exists so external tools / automations can
 * push leads into the same table with the same guarantees.
 */
export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return fail(
      "Supabase is not configured. LeadForge is running in Local Mode — leads are stored in the browser.",
      501,
      { code: "SUPABASE_NOT_CONFIGURED" }
    );
  }

  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return fail("Missing Authorization: Bearer <access token> header.", 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Expected a JSON body: { lead }");
  }

  const lead = body?.lead || body;
  if (!lead?.name) return fail("lead.name is required.");

  // Passing the caller's token means row-level security applies as if the user
  // wrote the row themselves — no service-role key anywhere in this app.
  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return fail("Invalid or expired access token.", 401);

  const record = { user_id: userData.user.id };
  for (const key of COLUMNS) record[key] = lead[key] ?? null;
  record.status = lead.status || "New";

  const { data, error } = await supabase
    .from("leads")
    .upsert(record, { onConflict: "user_id,osm_id" })
    .select()
    .single();

  if (error) return fail(error.message, 400);
  return json({ lead: data }, 201);
}

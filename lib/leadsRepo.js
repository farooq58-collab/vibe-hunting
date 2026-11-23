"use client";

import { supabase, isSupabaseConfigured } from "./supabaseClient";

const LOCAL_KEY = "leadforge.leads.v1";

const LEAD_COLUMNS = [
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

/** Strip UI-only fields (distance_km, enrichment state, …) before persisting. */
function toRecord(lead) {
  const record = {};
  for (const key of LEAD_COLUMNS) record[key] = lead[key] ?? null;
  record.status = lead.status || "New";
  return record;
}

/* ------------------------------ local mode ------------------------------ */

function readLocal() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(rows) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
  return rows;
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `local-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

/* ------------------------------- public API ------------------------------ */

export async function listLeads(userId) {
  if (!isSupabaseConfigured) {
    return readLocal().sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function saveLead(lead, userId) {
  const record = toRecord(lead);

  if (!isSupabaseConfigured) {
    const rows = readLocal();
    // Re-saving the same OSM business updates it instead of duplicating it.
    const existing = rows.findIndex(
      (r) => r.osm_id && record.osm_id && r.osm_id === record.osm_id
    );
    if (existing >= 0) {
      rows[existing] = { ...rows[existing], ...record };
      writeLocal(rows);
      return rows[existing];
    }
    const row = { ...record, id: newId(), created_at: new Date().toISOString() };
    writeLocal([row, ...rows]);
    return row;
  }

  const { data, error } = await supabase
    .from("leads")
    .upsert({ ...record, user_id: userId }, { onConflict: "user_id,osm_id" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateLead(id, patch, userId) {
  if (!isSupabaseConfigured) {
    const rows = readLocal().map((r) => (r.id === id ? { ...r, ...patch } : r));
    writeLocal(rows);
    return rows.find((r) => r.id === id);
  }

  const { data, error } = await supabase
    .from("leads")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteLead(id, userId) {
  if (!isSupabaseConfigured) {
    writeLocal(readLocal().filter((r) => r.id !== id));
    return true;
  }

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return true;
}

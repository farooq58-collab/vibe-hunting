"use client";

const HEADERS = [
  ["name", "Business Name"],
  ["niche", "Niche"],
  ["city", "City"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["website", "Website"],
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["whatsapp", "WhatsApp"],
  ["address", "Address"],
  ["status", "Status"],
  ["created_at", "Saved On"],
];

const escape = (value) => {
  const str = value == null ? "" : String(value);
  // Prefix formula-triggering characters so Excel/Sheets treat them as text.
  const safe = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
};

export function leadsToCsv(leads) {
  const head = HEADERS.map(([, label]) => escape(label)).join(",");
  const body = leads
    .map((lead) => HEADERS.map(([key]) => escape(lead[key])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}

/** Export happens entirely in the browser — no backend round trip. */
export function downloadCsv(leads, filename = "leadforge-leads.csv") {
  const blob = new Blob(["﻿", leadsToCsv(leads)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

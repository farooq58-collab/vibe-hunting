/**
 * Turn a saved lead + its generated outreach into one-click send links.
 *
 * The point: copy-paste is where outreach dies. If the message is already
 * written, the CRM should hand you a pre-filled WhatsApp thread or mail client
 * rather than a clipboard and a todo.
 */

/** "Subject: X\n\nbody" -> { subject, body }; falls back to a sane subject. */
export function splitSubject(message = "", lead = {}) {
  const match = message.match(/^\s*subject:\s*(.+)$/im);
  if (!match) {
    return { subject: `Quick idea for ${lead.name || "your business"}`, body: message.trim() };
  }
  return {
    subject: match[1].trim(),
    body: message.replace(match[0], "").trim(),
  };
}

/**
 * wa.me needs digits only, in international format. OSM phone numbers are
 * usually "+44 161 …" which converts cleanly; local formats starting with 0
 * cannot be resolved without knowing the country, so those are rejected rather
 * than sent to a wrong number.
 */
export function whatsappNumber(lead) {
  if (lead.whatsapp) {
    const fromLink = String(lead.whatsapp).match(/(?:wa\.me\/|phone=)(\+?\d{6,})/i);
    if (fromLink) return fromLink[1].replace(/\D/g, "");
  }
  const raw = String(lead.phone || "").split(/[;,/]/)[0].trim();
  if (!raw.startsWith("+")) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

export function whatsappLink(lead) {
  const number = whatsappNumber(lead);
  if (!number) return null;
  // Drop any "Subject:" line — that belongs to email, not a chat thread.
  const message = lead.outreach ? splitSubject(lead.outreach, lead).body : "";
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function mailtoLink(lead) {
  if (!lead.email) return null;
  const { subject, body } = splitSubject(lead.outreach || "", lead);
  const params = new URLSearchParams({ subject, body });
  // URLSearchParams encodes spaces as "+", which mail clients render literally.
  return `mailto:${lead.email}?${params.toString().replace(/\+/g, "%20")}`;
}

/** Every send route currently available for this lead. */
export function sendOptions(lead) {
  return [
    lead.email && { key: "email", icon: "📧", label: "Email", href: mailtoLink(lead) },
    whatsappLink(lead) && {
      key: "whatsapp",
      icon: "📱",
      label: "WhatsApp",
      href: whatsappLink(lead),
    },
    lead.phone && {
      key: "call",
      icon: "☎️",
      label: "Call",
      // Strip spaces/formatting — some dialers choke on them.
      href: `tel:${String(lead.phone).split(/[;,/]/)[0].replace(/[^\d+]/g, "")}`,
    },
  ].filter(Boolean);
}

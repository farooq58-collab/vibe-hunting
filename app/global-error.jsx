"use client";

/**
 * Last-resort boundary for errors thrown in the root layout itself.
 *
 * This one replaces the whole document, so it must render <html> and <body>
 * and cannot rely on the app's providers, fonts or global stylesheet — hence
 * the inline styles rather than Tailwind classes.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0A0A0A",
          color: "rgba(255,255,255,0.85)",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.75rem" }}>LeadForge failed to start</h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", margin: "0 0 1.5rem" }}>
            {error?.message || "An error occurred in the application shell."}
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#6366F1",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Reload the app
          </button>
        </div>
      </body>
    </html>
  );
}

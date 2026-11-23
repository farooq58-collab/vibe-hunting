import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Vibe Hunting — B2B & B2C Lead Intelligence & Outreach Engine",
  description:
    "Discover high-value local and international business leads across B2B & B2C, detect website & contact gaps, rate sales opportunity fit, and generate AI-crafted outreach pitches in seconds.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563EB'><path d='M13 10V3L4 14h7v7l9-11h-7z'/></svg>",
  },
};

export const viewport = {
  themeColor: "#FBFBFA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-body bg-canvas text-ink antialiased flex flex-col selection:bg-blue-600/15 selection:text-blue-900">
        <ToastProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col relative overflow-x-hidden">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

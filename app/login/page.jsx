"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { IconLightning, IconCheck, IconShieldCheck, IconSparkles } from "@/components/Icons";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading, isLocalMode, signIn, signUp } = useAuth();

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast("Welcome back to Vibe Hunting", "success");
        router.replace("/dashboard");
      } else {
        const { needsConfirmation } = await signUp(email, password);
        if (needsConfirmation) {
          toast("Confirmation link sent to your email", "info");
          setMode("signin");
        } else {
          toast("Account created successfully", "success");
          router.replace("/dashboard");
        }
      }
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (isLocalMode) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:py-24">
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-8 text-center shadow-card relative overflow-hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mx-auto mb-4 border border-amber-200">
            <IconShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">Local Browser Mode Active</h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md mx-auto">
            Supabase environment keys are not configured, so Vibe Hunting is running locally. All saved leads &amp; preferences are persisted directly in this browser.
          </p>
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-[11px] font-mono text-neutral-500 text-left">
            NEXT_PUBLIC_SUPABASE_URL=...<br />
            NEXT_PUBLIC_SUPABASE_ANON_KEY=...
          </div>
          <Link href="/dashboard" className="btn-primary mt-6 w-full py-3 text-sm font-bold">
            Proceed to My Saved Leads CRM
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20 grid md:grid-cols-2 gap-8 items-center">
      {/* Left Branding & Highlights */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-mono font-medium text-blue-700">
          <IconSparkles className="h-4 w-4 text-blue-600" />
          <span>Enterprise B2B Lead Intelligence</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-neutral-900 tracking-tight leading-tight">
          Supercharge your <span className="italic text-blue-600 font-serif">Outreach Velocity</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
          Access high-intent B2B prospect intelligence, automated defect audits, and AI-driven pitch generation with Vibe Hunting.
        </p>

        <div className="space-y-3 pt-2">
          {[
            "100% Free Open Data & Unlimited Local Lead Prospecting",
            "Multi-channel Contact Enrichment (Email, Phone, WhatsApp, Socials)",
            "AI-powered Pitch Scripting tuned for specific Industry Defects",
            "Cloud CRM Lead Sync & CSV Export Pipeline",
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs font-medium text-neutral-700">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                <IconCheck className="h-3 w-3" />
              </div>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Auth Card */}
      <div className="rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="flex rounded-xl bg-neutral-100/80 p-1 border border-neutral-200/80 mb-6">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "signin" ? "bg-white text-neutral-900 shadow-xs border border-neutral-200/70" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "signup" ? "bg-white text-neutral-900 shadow-xs border border-neutral-200/70" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Work Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full py-3 text-sm font-bold mt-2"
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Authenticating...</span>
              </span>
            ) : mode === "signin" ? (
              "Sign In to Vibe Hunting"
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

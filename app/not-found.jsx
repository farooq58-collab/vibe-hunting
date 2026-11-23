import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <div className="glass p-8 text-center">
        <p className="font-heading text-4xl font-bold text-accent-soft">404</p>
        <h1 className="mt-3 font-heading text-xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-white/50">
          That route does not exist in LeadForge.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/" className="btn-primary flex-1">
            Discover leads
          </Link>
          <Link href="/dashboard" className="btn-ghost flex-1">
            Saved leads
          </Link>
        </div>
      </div>
    </div>
  );
}

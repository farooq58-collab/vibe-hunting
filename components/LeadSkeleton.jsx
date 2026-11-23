export default function LeadSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-neutral-200/90 bg-white shadow-card flex flex-col p-5 space-y-4">
          <div className="flex items-start justify-between gap-3 pt-1">
            <div className="space-y-2 flex-1">
              <div className="skeleton h-5 w-3/4 rounded-md" />
              <div className="skeleton h-3 w-1/2 rounded-md" />
            </div>
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="skeleton h-4 w-full rounded-md" />
            <div className="skeleton h-4 w-5/6 rounded-md" />
          </div>
          <div className="skeleton h-12 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-100">
            <div className="skeleton h-8 w-full rounded-xl" />
            <div className="skeleton h-8 w-full rounded-xl" />
            <div className="skeleton h-8 w-full rounded-xl" />
            <div className="skeleton h-8 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

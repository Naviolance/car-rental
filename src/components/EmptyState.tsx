// A Server Component (no interactivity) — the caller passes its own
// icon element so this doesn't need to know about Phosphor's types at
// all, and each of the three places that use this (no cars, no filtered
// results, no bookings) can pick whichever icon fits.
export function EmptyState({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded border border-dashed border-mist py-12 text-center text-gray-500">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rust/10 text-rust">
        {icon}
      </span>
      <p>{children}</p>
    </div>
  );
}

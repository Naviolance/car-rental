"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/cars", label: "Fleet" },
  { href: "/admin/bookings", label: "Bookings" },
];

// A client component (needs usePathname for the active-tab state) inside
// an otherwise server-rendered admin/layout.tsx — the auth check that
// layout does stays server-side; only "which tab is active" needs to be
// client-aware.
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-mist pb-4 text-sm">
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded px-3 py-1.5 transition-colors ${
              active
                ? "bg-charcoal text-cream"
                : "text-gray-600 hover:bg-mist/60"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

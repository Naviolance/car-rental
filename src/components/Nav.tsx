import Link from "next/link";
import { auth } from "@/auth";
import { NavLinks } from "@/components/NavLinks";

// A Server Component, not a Client Component — it calls auth() directly on
// the server to read the session and render the right markup up front.
// Auth.js v5's App Router model is built around this: you don't need the
// old next-auth v4 pattern of wrapping the whole app in a client-side
// <SessionProvider> just to know who's signed in. The actual link list is
// split into NavLinks (a client component) only because the mobile
// hamburger needs local open/closed state.
export async function Nav() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="relative flex items-center justify-between gap-3 bg-charcoal px-6 py-4 text-cream">
      <Link href="/" className="text-lg font-semibold text-ember">
        Car Rental
      </Link>

      {/* An admin isn't renting cars themselves, so "My bookings" has
          nothing for them — NavLinks hides it for admin accounts. */}
      <NavLinks isAuthenticated={!!session?.user} isAdmin={isAdmin} />
    </header>
  );
}

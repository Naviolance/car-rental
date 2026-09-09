import Link from "next/link";
import { SquaresFour, SignOut } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions/auth";

// A Server Component, not a Client Component — it calls auth() directly on
// the server to read the session and render the right markup up front.
// Auth.js v5's App Router model is built around this: you don't need the
// old next-auth v4 pattern of wrapping the whole app in a client-side
// <SessionProvider> just to know who's signed in.
export async function Nav() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 bg-charcoal px-6 py-4 text-cream">
      <Link href="/" className="text-lg font-semibold text-ember">
        Car Rental
      </Link>

      <nav className="flex flex-wrap items-center gap-4 text-sm">
        <Link href="/about" className="hover:text-ember">
          About
        </Link>
        {session?.user ? (
          <>
            {/* An admin isn't renting cars themselves, so "My bookings"
                has nothing for them — shown only for non-admin accounts. */}
            {!isAdmin && (
              <Link href="/bookings" className="hover:text-ember">
                My bookings
              </Link>
            )}
            <span className="h-5 w-px bg-gray-600" aria-hidden />
            {/* Book Now sits at the far right, immediately before the
                admin dashboard icon for admins — the two most-used
                destinations for each audience, grouped together at the
                end of the row instead of Book Now leading and the rest
                trailing after it. */}
            <Link
              href="/cars"
              className="rounded bg-ember px-4 py-2 font-medium text-charcoal transition-colors hover:bg-rust hover:text-white"
            >
              Book Now
            </Link>
            {isAdmin && (
              <Link
                href="/admin/cars"
                aria-label="Admin dashboard"
                className="hover:text-ember"
              >
                <SquaresFour size={20} />
              </Link>
            )}
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sign out"
                className="hover:text-ember"
              >
                <SignOut size={20} />
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-ember">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-ember">
              Register
            </Link>
            <span className="h-5 w-px bg-gray-600" aria-hidden />
            <Link
              href="/cars"
              className="rounded bg-ember px-4 py-2 font-medium text-charcoal transition-colors hover:bg-rust hover:text-white"
            >
              Book Now
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

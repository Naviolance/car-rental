import Link from "next/link";
import { auth } from "@/auth";

// Matches the reference site's structural pattern (dark, multi-column
// footer) but the content is honest to what this actually is: a
// portfolio demo, not a registered business. No fabricated address,
// phone number, or "100K happy customers" — real links to pages that
// actually exist, and a genuine tech-stack credit instead of invented
// contact info.
export async function Footer() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal px-6 py-10 text-mist">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold text-ember">Car Rental</span>
          <p className="text-sm">
            Browse the fleet, pick your dates, and book by the day.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-cream">Explore</span>
          <Link href="/" className="hover:text-ember">
            Home
          </Link>
          <Link href="/cars" className="hover:text-ember">
            Browse cars
          </Link>
          {/* Same reasoning as Nav: an admin isn't renting cars, so
              "My bookings" has nothing for them — omitted rather than
              shown to an audience it doesn't apply to. */}
          {!isAdmin && (
            <Link href={session?.user ? "/bookings" : "/login"} className="hover:text-ember">
              {session?.user ? "My bookings" : "Sign in"}
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-cream">Built with</span>
          <p>Next.js · Prisma · Supabase · Tailwind CSS</p>
          <p className="text-xs text-mist/60">
            A portfolio project — not a real rental service.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl border-t border-mist/20 pt-4 text-center text-xs text-mist/60">
        © {year} Car Rental
      </div>
    </footer>
  );
}

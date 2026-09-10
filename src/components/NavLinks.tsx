"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X, SquaresFour, SignOut } from "@phosphor-icons/react";
import { logoutAction } from "@/lib/actions/auth";

// Nav.tsx stays a server component so it can call auth() directly; this
// piece is split out purely because the mobile hamburger needs local
// open/closed state, which only a client component can hold. Below `sm`
// the desktop link row (unchanged from before) is hidden and replaced by
// a toggle button that reveals the same destinations stacked in a
// dropdown panel — previously they had no mobile treatment at all and
// just wrapped onto extra lines inside the header alongside the divider
// bars, which is what read as cluttered/unprofessional on a phone.
export function NavLinks({
  isAuthenticated,
  isAdmin,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="hidden items-center gap-4 text-sm sm:flex">
        <Link href="/about" className="hover:text-ember">
          About
        </Link>
        {isAuthenticated ? (
          <>
            {!isAdmin && (
              <Link href="/bookings" className="hover:text-ember">
                My bookings
              </Link>
            )}
            <span className="h-5 w-px bg-gray-600" aria-hidden />
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

      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="text-cream hover:text-ember sm:hidden"
      >
        {open ? <X size={24} /> : <List size={24} />}
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-t border-gray-700 bg-charcoal p-3 text-sm shadow-lg sm:hidden">
          <Link
            href="/about"
            onClick={close}
            className="rounded px-3 py-2.5 hover:bg-white/5"
          >
            About
          </Link>
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <Link
                  href="/bookings"
                  onClick={close}
                  className="rounded px-3 py-2.5 hover:bg-white/5"
                >
                  My bookings
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin/cars"
                  onClick={close}
                  className="flex items-center gap-2 rounded px-3 py-2.5 hover:bg-white/5"
                >
                  <SquaresFour size={18} aria-hidden="true" />
                  Admin dashboard
                </Link>
              )}
              <Link
                href="/cars"
                onClick={close}
                className="mt-1 rounded bg-ember px-4 py-2.5 text-center font-medium text-charcoal transition-colors hover:bg-rust hover:text-white"
              >
                Book Now
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded px-3 py-2.5 text-left hover:bg-white/5"
                >
                  <SignOut size={18} aria-hidden="true" />
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={close}
                className="rounded px-3 py-2.5 hover:bg-white/5"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="rounded px-3 py-2.5 hover:bg-white/5"
              >
                Register
              </Link>
              <Link
                href="/cars"
                onClick={close}
                className="mt-1 rounded bg-ember px-4 py-2.5 text-center font-medium text-charcoal transition-colors hover:bg-rust hover:text-white"
              >
                Book Now
              </Link>
            </>
          )}
        </nav>
      )}
    </>
  );
}

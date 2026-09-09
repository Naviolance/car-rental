import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Runs on the Node.js runtime by default in Next.js 16 (confirmed against
// our installed version's own docs) — that's what makes it safe to import
// the full @/auth here, Prisma adapter and bcrypt included, without the
// Edge-runtime split-config workaround older Auth.js + Prisma + middleware
// setups needed.
//
// This is the fast, whole-route-tree gate — redirects happen before any
// page even starts rendering. It does NOT replace the auth checks already
// inside admin/layout.tsx, bookings/page.tsx, or the Server Actions
// themselves: both Next.js's and Auth.js's own docs are explicit that a
// Server Action is just a POST to its page's route, so a matcher change
// or a moved route can silently drop proxy coverage. Those in-code checks
// are the actual enforcement; this is a UX/performance layer on top.
export const proxy = auth((req) => {
  if (!req.auth?.user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  // The matcher below already restricts this proxy to /admin and
  // /bookings, so a signed-in non-admin only needs checking against the
  // admin tree specifically.
  if (req.nextUrl.pathname.startsWith("/admin") && req.auth.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/bookings/:path*"],
};

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Car Rental";
const description =
  "Browse the fleet, pick your dates, and book by the day — no hidden fees. A full, working portfolio demo, not a real rental business.";

export const metadata: Metadata = {
  // Needed so Next.js can turn opengraph-image.tsx into an absolute URL —
  // without this, a shared link's image tag would resolve to a relative
  // path no external platform (Slack, iMessage, LinkedIn) can fetch.
  metadataBase: new URL("https://car-rental-xi-lemon.vercel.app"),
  title: { default: title, template: `%s — ${title}` },
  description,
  openGraph: {
    title,
    description,
    siteName: title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* The @modal parallel slot: empty (renders null via
            @modal/default.tsx) on every route except an intercepted
            /login navigation, where it overlays the sign-in form on top
            of whatever page is still rendered in `children` above. */}
        {modal}
        <CookieConsent />
      </body>
    </html>
  );
}

import Link from "next/link";

export const metadata = { title: "Privacy & cookies — Car Rental" };

// Same "real functionality, no fabricated claims" rule the About page
// follows — this lists what the site actually stores in a visitor's
// browser rather than the generic boilerplate most cookie-notice pages
// copy-paste regardless of what the site really does.
const stored = [
  {
    name: "Session cookie",
    purpose:
      "Keeps you signed in between page loads. Deleted when you sign out or it expires. Strictly necessary — the site can't tell you're logged in without it.",
  },
  {
    name: '"Find my car" dismissed flag',
    purpose:
      "A note in your browser's local storage so the pop-up doesn't reopen on every visit once you've closed it once. Purely functional, nothing sent anywhere.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-3xl font-bold">Privacy & cookies</h1>
        <p className="text-gray-600">
          What this site actually stores in your browser — no more, no less.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {stored.map((item) => (
          <div key={item.name} className="rounded-lg border border-mist p-4">
            <p className="font-medium">{item.name}</p>
            <p className="mt-1 text-sm text-gray-600">{item.purpose}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-mist bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-medium text-charcoal">What&apos;s not here</p>
        <p className="mt-1">
          No analytics, no advertising or retargeting pixels, no
          third-party trackers, and nothing sold or shared with anyone.
        </p>
      </div>

      <p className="text-sm text-gray-500">
        Account data you provide (name, email, bookings, reviews) is
        stored to make the booking flow work — that&apos;s covered by each
        feature as you use it. This page is specifically about what ends
        up sitting in your browser.
      </p>

      <div className="flex justify-center">
        <Link
          href="/"
          className="rounded bg-ember px-5 py-2.5 font-medium text-charcoal transition-colors hover:bg-rust hover:text-white"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Check, X } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";

// The site's whole voice, from the footer's own comment on down, has
// been "real functionality, no fabricated marketing claims" — no
// invented "10,000 happy customers," no fake founding story. An
// in-universe About page would need exactly that kind of fabrication,
// so this one stays honest instead: what this project actually is, a
// portfolio piece, with real numbers pulled from the database rather
// than invented ones.
export default async function AboutPage() {
  const [carCount, reviewStats] = await Promise.all([
    prisma.car.count({ where: { isActive: true } }),
    prisma.review.aggregate({ _avg: { rating: true }, _count: { rating: true } }),
  ]);
  const avgRating = reviewStats._avg.rating ?? 0;
  const reviewCount = reviewStats._count.rating;

  const stats = [
    { label: "Cars in the fleet", value: String(carCount) },
    {
      label: "Average rating",
      value: reviewCount > 0 ? avgRating.toFixed(1) : "—",
    },
    { label: "Reviews collected", value: String(reviewCount) },
  ];

  const real = [
    "Authentication (Auth.js, credentials + Google) and a real Postgres database",
    "Availability checking — two bookings can't overlap the same car and dates",
    "An admin panel for managing the fleet and reviewing bookings",
    "The full booking flow: pick dates, see the total, confirm, get a real record",
  ];

  const notReal = [
    "The cars — real photos, but not an actual rental fleet",
    "Payments — confirming a booking never charges anything",
    "The company itself — this isn't a registered rental business",
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-16 px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold">About this project</h1>
        <p className="max-w-xl text-gray-600">
          Car Rental is a portfolio project — a full, working demonstration
          of a car rental booking flow, built to be genuinely functional
          rather than a static mockup.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 rounded-lg border border-mist p-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
            <span className="text-3xl font-bold text-ember">{stat.value}</span>
            <span className="text-sm text-gray-600">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">What&apos;s real</h2>
          <ul className="flex flex-col gap-2.5">
            {real.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <Check
                  size={16}
                  weight="bold"
                  className="mt-0.5 shrink-0 text-green-600"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">What&apos;s not</h2>
          <ul className="flex flex-col gap-2.5">
            {notReal.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <X
                  size={16}
                  weight="bold"
                  className="mt-0.5 shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-mist pt-8">
        <h2 className="text-lg font-semibold">Built with</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Next.js",
            "React",
            "Prisma",
            "PostgreSQL",
            "Auth.js",
            "Tailwind CSS",
            "Framer Motion",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-mist px-3 py-1 text-sm text-gray-700"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/cars"
          className="rounded bg-ember px-5 py-2.5 font-medium text-charcoal transition-colors hover:bg-rust hover:text-white"
        >
          Browse the fleet
        </Link>
      </div>
    </div>
  );
}

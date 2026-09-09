import Link from "next/link";
import { Car } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CarCard } from "@/components/CarCard";
import { CarFinderWizard } from "@/components/CarFinderWizard";
import { HeroContent } from "@/components/HeroContent";
import { WhyBookSection } from "@/components/WhyBookSection";
import { WhyUsSection } from "@/components/WhyUsSection";
import { EmptyState } from "@/components/EmptyState";
import { getReviewStats } from "@/lib/reviewStats";

// A Server Component querying Prisma directly — no API route needed for
// the page itself to get its data. This only works because it runs on the
// server; the query and its result never touch the client bundle.
export default async function HomePage() {
  const [cars, session] = await Promise.all([
    // Featured subset, not the full fleet — full browsing with filters
    // lives at /cars.
    prisma.car.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    auth(),
  ]);
  // Needs the car IDs from the query above, so this can't join the
  // Promise.all above it.
  const reviewStats = await getReviewStats(cars.map((car) => car.id));

  return (
    <div className="flex flex-col gap-12">
      {/* A real photo now, not a flat rust field — rust survives as a
          tint over it (gradient overlay) rather than disappearing, so
          the hero still reads as this site's color, not a generic stock
          photo with text slapped on. HeroContent is a client component
          (motion needs it); this section tag stays server-rendered since
          the image/gradient are just static markup. */}
      <section className="relative overflow-hidden px-6 py-16 text-cream">
        {/* eslint-disable-next-line @next/next/no-img-element -- external
            hotlinked photo, same as every other seed image in this app */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/c/c2/NM_124_and_US_66_WB_near_Budville_NM.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-rust/90 via-rust/80 to-charcoal/70"
          aria-hidden
        />
        <div className="relative">
          <HeroContent />
        </div>
      </section>

      {/* CarFinderWizard renders as a fixed-position overlay (or a
          floating button once dismissed), not inline content — it can
          live anywhere in the tree. It's a Client Component and can't
          call auth() itself, so the session is read here, server-side,
          and only the one primitive value it actually needs is passed
          down. */}
      <CarFinderWizard userName={session?.user?.name} />

      <WhyBookSection />

      <section id="cars" className="flex flex-col gap-4 px-6 pb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Available cars</h2>
          <Link href="/cars" className="text-sm underline">
            Browse all cars
          </Link>
        </div>
        {cars.length === 0 ? (
          <EmptyState icon={<Car size={24} weight="light" aria-hidden="true" />}>
            No cars available right now.
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={{ ...car, pricePerDay: Number(car.pricePerDay) }}
                avgRating={reviewStats.get(car.id)?.avg}
                reviewCount={reviewStats.get(car.id)?.count}
              />
            ))}
          </div>
        )}
      </section>

      <WhyUsSection />
    </div>
  );
}

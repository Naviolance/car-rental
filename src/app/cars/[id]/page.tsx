import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { BookingSteps } from "@/components/BookingSteps";
import { BookingSection } from "@/components/BookingSection";
import { parseDateRange } from "@/lib/dateRangeParams";
import { starString } from "@/lib/rating";

export default async function CarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const { id } = await params;
  const { startDate, endDate } = await searchParams;
  const dateRange = parseDateRange(startDate, endDate);
  const [car, session, reviews] = await Promise.all([
    prisma.car.findUnique({ where: { id } }),
    auth(),
    prisma.review.findMany({
      where: { carId: id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // A car ID that doesn't exist (bad link, deleted car, someone typing a
  // random string) should render the real 404 page, not crash or show a
  // blank page.
  if (!car) {
    notFound();
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  const bookingDays = dateRange.isValid
    ? Math.round(
        (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
          86_400_000
      )
    : 0;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
      <Link
        href="/cars"
        className="flex w-fit items-center gap-1 text-sm text-gray-500 underline"
      >
        <CaretLeft size={14} aria-hidden="true" /> Back to all cars
      </Link>

      {/* Vehicle (this page) is step 1 — already "done" by virtue of
          being here. If a date range was carried forward (the finder
          wizard, or a filter on /cars), Dates is done too and Confirm is
          next; otherwise Dates is still the active step. */}
      <BookingSteps currentStep={dateRange.isValid ? 3 : 2} />

      {/* eslint-disable-next-line @next/next/no-img-element -- external
          placeholder image; swapping to next/image once cars come from
          Supabase Storage uploads (roadmap step 6) */}
      <img
        src={car.imageUrl}
        alt={`${car.make} ${car.model}`}
        className="h-80 w-full rounded-lg object-cover"
      />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">
            {car.make} {car.model}
          </h1>
          <p className="text-gray-500">
            {car.year} · {car.location}
          </p>
          {avgRating !== null && (
            <p className="text-sm text-rust">
              {starString(avgRating)}{" "}
              <span className="text-gray-500">
                ({reviews.length} review{reviews.length === 1 ? "" : "s"})
              </span>
            </p>
          )}
        </div>
        <p className="text-2xl font-semibold">
          ${Number(car.pricePerDay).toFixed(2)}
          <span className="text-base font-normal text-gray-500">/day</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded bg-gray-100 px-3 py-1">{car.category}</span>
        <span className="rounded bg-gray-100 px-3 py-1">
          {car.transmission}
        </span>
        <span className="rounded bg-gray-100 px-3 py-1">{car.fuelType}</span>
        <span className="rounded bg-gray-100 px-3 py-1">
          {car.seats} seats
        </span>
      </div>

      {car.description && (
        <p className="text-gray-700">{car.description}</p>
      )}

      {/* Picking dates never requires being signed in — only the final
          submit does, so anyone landing here directly (browsing /cars, a
          shared link, wherever) can set dates right here instead of
          hitting a dead end. Placed right after the price/tags, ahead of
          the history and reviews reading material — this is the one
          thing on the page someone actually books through, so it
          shouldn't be the last thing they scroll to. */}
      <BookingSection
        carId={car.id}
        pricePerDay={Number(car.pricePerDay)}
        isSignedIn={Boolean(session?.user)}
        isValid={dateRange.isValid}
        days={bookingDays}
        startDateValue={startDate ?? ""}
        endDateValue={endDate ?? ""}
        startDateLabel={
          dateRange.isValid ? dateRange.startDate.toLocaleDateString() : ""
        }
        endDateLabel={
          dateRange.isValid ? dateRange.endDate.toLocaleDateString() : ""
        }
      />

      {car.history && (
        <div className="flex flex-col gap-2 border-t border-mist pt-6">
          <h2 className="text-lg font-semibold">
            About the {car.make} {car.model}
          </h2>
          <p className="text-gray-700">{car.history}</p>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-mist pt-6">
          <h2 className="text-lg font-semibold">
            Reviews ({reviews.length})
          </h2>
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex gap-3 rounded border border-mist p-3"
              >
                {/* Initial-letter avatar, not a placeholder image — this
                    app has no profile photos, and a fake generic avatar
                    icon would just be decoration; this at least carries
                    real information (whose review it is). */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist text-sm font-medium text-charcoal">
                  {(review.user.name ?? "A").charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col gap-0.5 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {review.user.name ?? "A customer"}
                    </span>
                    <span className="text-rust">
                      {starString(review.rating)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {review.createdAt.toLocaleDateString()}
                  </p>
                  {review.comment && (
                    <p className="mt-1 text-gray-700">{review.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/generated/prisma/enums";
import { parsePage, totalPagesFor, PAGE_SIZE } from "@/lib/pagination";
import { Pagination } from "@/components/Pagination";
import { ReviewForm } from "@/components/ReviewForm";
import { EmptyState } from "@/components/EmptyState";
import { StarRating } from "@/components/StarRating";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-200 text-gray-600",
  COMPLETED: "bg-blue-100 text-blue-800",
};

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; page?: string }>;
}) {
  // src/proxy.ts already redirects anonymous visitors away from /bookings
  // before a request reaches this page — this is the defense-in-depth
  // layer underneath it, same reasoning as admin/layout.tsx.
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = parsePage(params.page);

  const [bookings, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: session.user.id },
      include: { car: true, review: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.booking.count({ where: { userId: session.user.id } }),
  ]);
  const totalPages = totalPagesFor(totalCount);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold">My bookings</h1>

      {params.success && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Booking request sent — it&apos;s pending confirmation.
        </p>
      )}

      {bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarBlank size={24} weight="light" aria-hidden="true" />}
        >
          No bookings yet.{" "}
          <Link href="/cars" className="underline">
            Browse cars
          </Link>{" "}
          to book one.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => {
            // Eligible for a review: COMPLETED (an admin has confirmed
            // the rental actually happened — not just "CONFIRMED and the
            // end date has passed," which a booking can satisfy without
            // anyone ever having confirmed the car was actually
            // returned) and hasn't been reviewed yet.
            const canReview = booking.status === "COMPLETED" && !booking.review;

            return (
              <div
                key={booking.id}
                className="flex flex-col gap-3 rounded border border-mist p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/cars/${booking.carId}`}
                    className="group flex items-center gap-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- external hotlinked seed images, same as CarCard */}
                    <img
                      src={booking.car.imageUrl}
                      alt={`${booking.car.make} ${booking.car.model}`}
                      className="h-14 w-20 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium group-hover:underline">
                        {booking.car.make} {booking.car.model}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.startDate.toLocaleDateString()} –{" "}
                        {booking.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                    <p className="text-sm font-medium">
                      ${Number(booking.totalPrice).toFixed(2)}
                    </p>
                  </div>
                </div>

                {booking.review ? (
                  <p className="border-t border-mist pt-3 text-sm">
                    <span className="text-rust">
                      <StarRating rating={booking.review.rating} />
                    </span>{" "}
                    {booking.review.comment && (
                      <span className="text-gray-600">
                        — {booking.review.comment}
                      </span>
                    )}
                  </p>
                ) : (
                  canReview && <ReviewForm bookingId={booking.id} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/bookings"
        searchParams={params}
      />
    </div>
  );
}

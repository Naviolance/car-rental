import { Check, CheckCircle, X } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { updateBookingStatus } from "@/lib/actions/admin";
import type { BookingStatus } from "@/generated/prisma/enums";
import { parsePage, totalPagesFor, PAGE_SIZE } from "@/lib/pagination";
import { Pagination } from "@/components/Pagination";

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-200 text-gray-600",
  COMPLETED: "bg-blue-100 text-blue-800",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);

  const [bookings, totalCount] = await Promise.all([
    prisma.booking.findMany({
      include: { car: true, user: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.booking.count(),
  ]);
  const totalPages = totalPagesFor(totalCount);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Bookings</h1>

      <div className="flex flex-col gap-2">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded border border-mist p-3"
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin list thumbnail, same external seed images as the public CarCard */}
              <img
                src={booking.car.imageUrl}
                alt=""
                className="h-12 w-16 rounded object-cover"
              />
              <div>
                <p className="font-medium">
                  {booking.car.make} {booking.car.model} —{" "}
                  {booking.user.name ?? booking.user.email}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.startDate.toLocaleDateString()} –{" "}
                  {booking.endDate.toLocaleDateString()} · $
                  {Number(booking.totalPrice).toFixed(2)}
                  {booking.driverAge && ` · Driver ${booking.driverAge}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[booking.status]}`}
              >
                {booking.status}
              </span>
              {booking.status === "PENDING" && (
                <div className="flex gap-2 text-sm">
                  <form action={updateBookingStatus}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="status" value="CONFIRMED" />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded border border-green-200 bg-green-50 px-2.5 py-1 text-green-700 outline-none transition-colors hover:bg-green-100 focus-visible:ring-2 focus-visible:ring-green-400/40"
                    >
                      <Check size={14} aria-hidden="true" />
                      Confirm
                    </button>
                  </form>
                  <form action={updateBookingStatus}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="status" value="CANCELLED" />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-red-700 outline-none transition-colors hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-400/40"
                    >
                      <X size={14} aria-hidden="true" />
                      Cancel
                    </button>
                  </form>
                </div>
              )}
              {/* COMPLETED is a real, storable status (not just a display
                  label computed from CONFIRMED + a past date) — this is
                  the one place it actually gets set. Reviews only became
                  eligible once this had run, so a booking that's simply
                  overdue but never marked complete now correctly stays
                  un-reviewable instead of silently becoming reviewable
                  the moment its end date passed. */}
              {booking.status === "CONFIRMED" &&
                booking.endDate < new Date() && (
                  <form action={updateBookingStatus}>
                    <input
                      type="hidden"
                      name="bookingId"
                      value={booking.id}
                    />
                    <input type="hidden" name="status" value="COMPLETED" />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-sm text-blue-700 outline-none transition-colors hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-400/40"
                    >
                      <CheckCircle size={14} aria-hidden="true" />
                      Mark completed
                    </button>
                  </form>
                )}
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/bookings"
        searchParams={params}
      />
    </div>
  );
}

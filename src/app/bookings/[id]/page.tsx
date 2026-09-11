import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_STYLES } from "@/lib/bookingStatusStyles";
import { BookingSteps } from "@/components/BookingSteps";

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const { success } = await searchParams;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { car: true },
  });

  // Not found, or found but belongs to someone else — either way this
  // visitor doesn't get to see it. A bare notFound() here (rather than a
  // "not yours" message) avoids confirming to a signed-in user that some
  // other booking ID does exist.
  if (!booking || booking.userId !== session.user.id) {
    notFound();
  }

  const days = Math.round(
    (booking.endDate.getTime() - booking.startDate.getTime()) / 86_400_000
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      {/* All four steps read as complete here — currentStep past the end
          of STEPS is what makes BookingSteps mark every step done
          (including this one) instead of leaving the last one as merely
          "active." */}
      <BookingSteps currentStep={5} />

      {success && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle
            size={24}
            weight="fill"
            className="mt-0.5 shrink-0 text-green-600"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-green-800">Booking successful</p>
            <p className="text-sm text-green-700">
              Your request has been sent and is pending confirmation.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-lg border border-mist p-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">Booking details</h1>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[booking.status]}`}
          >
            {booking.status}
          </span>
        </div>

        <Link
          href={`/cars/${booking.carId}`}
          className="group flex items-center gap-4"
        >
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded">
            <Image
              src={booking.car.imageUrl}
              alt={`${booking.car.make} ${booking.car.model}`}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium group-hover:underline">
              {booking.car.make} {booking.car.model}
            </p>
            <p className="text-sm text-gray-500">
              {booking.car.year} · {booking.car.location}
            </p>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4 border-t border-mist pt-4 text-sm">
          <div>
            <p className="text-gray-500">Pick-up</p>
            <p className="font-medium">
              {booking.startDate.toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Return</p>
            <p className="font-medium">
              {booking.endDate.toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Duration</p>
            <p className="font-medium">
              {days} day{days === 1 ? "" : "s"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Total price</p>
            <p className="font-medium">
              ${Number(booking.totalPrice).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/bookings"
          className="rounded bg-ember px-5 py-2.5 text-center font-medium text-charcoal transition-colors hover:bg-rust hover:text-white"
        >
          My bookings
        </Link>
        <Link
          href="/cars"
          className="rounded border border-mist px-5 py-2.5 text-center font-medium text-charcoal transition-colors hover:border-rust"
        >
          Browse more cars
        </Link>
      </div>
    </div>
  );
}

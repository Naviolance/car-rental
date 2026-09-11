"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma/enums";
import { isValidDriverAge } from "@/lib/driverAge";

export type CreateBookingState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function createBooking(
  _prevState: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const carId = formData.get("carId");
  const startDateRaw = formData.get("startDate");
  const endDateRaw = formData.get("endDate");
  const driverAgeRaw = formData.get("driverAge");

  if (
    typeof carId !== "string" ||
    typeof startDateRaw !== "string" ||
    typeof endDateRaw !== "string"
  ) {
    return { status: "error", message: "Missing booking details." };
  }

  // Independent of the dropdown the form renders — a direct POST can
  // skip it entirely, so this is the real gate, same reasoning as the
  // date checks below.
  if (!isValidDriverAge(driverAgeRaw)) {
    return {
      status: "error",
      message: "Enter a valid driver's age (18 or older).",
    };
  }
  const driverAge = Number(driverAgeRaw);

  const startDate = new Date(startDateRaw);
  const endDate = new Date(endDateRaw);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate >= endDate ||
    startDate < today
  ) {
    return {
      status: "error",
      message: "Those dates aren't valid — go back and pick them again.",
    };
  }

  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car || !car.isActive) {
    return {
      status: "error",
      message: "This car isn't available for booking anymore.",
    };
  }

  const days = Math.round(
    (endDate.getTime() - startDate.getTime()) / 86_400_000
  );
  const totalPrice = (Number(car.pricePerDay) * days).toFixed(2);

  // redirect() works by throwing, so its call has to sit outside this
  // try/catch — inside it, that throw would run straight into the catch
  // block below instead of reaching Next.js.
  let bookingId: string;

  try {
    // Wrapped in a transaction so the "is it free?" check and the actual
    // insert happen as one unit — without this, two people could both
    // pass the availability check for the same dates a moment apart and
    // both get a booking created. This narrows that window a lot, though
    // a fully airtight guarantee would need a database-level exclusion
    // constraint on the date range, which is a reasonable next hardening
    // step rather than something this scope requires today.
    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          carId,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });
      if (conflict) {
        throw new Error("UNAVAILABLE");
      }
      return tx.booking.create({
        data: {
          carId,
          userId: session.user.id,
          startDate,
          endDate,
          totalPrice,
          status: BookingStatus.PENDING,
          driverAge,
        },
      });
    });

    bookingId = booking.id;
  } catch (error) {
    if (error instanceof Error && error.message === "UNAVAILABLE") {
      return {
        status: "error",
        message:
          "Someone else just booked this car for those dates. Please pick different dates.",
      };
    }
    throw error;
  }

  redirect(`/bookings/${bookingId}?success=1`);
}

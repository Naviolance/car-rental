"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ReviewState = { status: "idle" } | { status: "error"; message: string };

export async function createReview(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "You need to be signed in to leave a review." };
  }

  const bookingId = formData.get("bookingId");
  const rating = Number(formData.get("rating"));
  const comment = formData.get("comment");

  if (
    typeof bookingId !== "string" ||
    !bookingId ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return { status: "error", message: "Please pick a rating from 1 to 5." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });

  // Never trust that the review form only appeared for an eligible
  // booking — re-verify ownership, status, and timing server-side, same
  // principle as every other action in this app. Someone could submit
  // straight to this action for a booking that isn't theirs, isn't
  // confirmed, hasn't happened yet, or already has a review.
  if (
    !booking ||
    booking.userId !== session.user.id ||
    booking.status !== "CONFIRMED" ||
    booking.endDate > new Date() ||
    booking.review
  ) {
    return { status: "error", message: "This booking isn't eligible for a review." };
  }

  await prisma.review.create({
    data: {
      bookingId: booking.id,
      carId: booking.carId,
      userId: booking.userId,
      rating,
      comment: typeof comment === "string" && comment ? comment : null,
    },
  });

  redirect("/bookings");
}

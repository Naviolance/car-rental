"use client";

import { useActionState } from "react";
import { createBooking, type CreateBookingState } from "@/lib/actions/booking";

const initialState: CreateBookingState = { status: "idle" };

export function BookingForm({
  carId,
  startDate,
  endDate,
}: {
  carId: string;
  startDate: string;
  endDate: string;
}) {
  const [state, formAction, isPending] = useActionState(
    createBooking,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="carId" value={carId} />
      <input type="hidden" name="startDate" value={startDate} />
      <input type="hidden" name="endDate" value={endDate} />

      {state.status === "error" && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-ember px-4 py-2 text-charcoal transition-colors hover:bg-rust hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-ember disabled:hover:text-charcoal"
      >
        {isPending ? "Confirming…" : "Confirm booking"}
      </button>
    </form>
  );
}

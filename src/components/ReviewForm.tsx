"use client";

import { useActionState } from "react";
import { createReview, type ReviewState } from "@/lib/actions/review";
import { inputClassName } from "@/lib/formStyles";
import { Select } from "@/components/Select";

const initialState: ReviewState = { status: "idle" };

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, isPending] = useActionState(
    createReview,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-mist pt-3">
      <input type="hidden" name="bookingId" value={bookingId} />

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Rate this rental
        <Select name="rating" required defaultValue="" className="w-32">
          <option value="" disabled>
            Select
          </option>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {"★".repeat(value)}
              {"☆".repeat(5 - value)}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Comment (optional)
        <textarea
          name="comment"
          rows={2}
          className={inputClassName}
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded bg-ember px-3 py-1.5 text-sm text-charcoal transition-colors hover:bg-rust hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-ember disabled:hover:text-charcoal"
      >
        {isPending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}

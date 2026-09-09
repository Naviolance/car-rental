"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarBlank } from "@phosphor-icons/react";
import { CompactDateField } from "@/components/CompactDateField";
import { BookingForm } from "@/components/BookingForm";

// Two plain date fields, not the full calendar grid the old version
// opened here: this is a small, single-purpose card, not a destination
// in itself, so it stays minimal and lets the accent color (ember
// border, the one border color on this page that isn't neutral mist)
// carry the "this is the actionable one" signal instead of size. Where
// this sits on the page is decided by its caller, not here.
export function BookingSection({
  carId,
  pricePerDay,
  isSignedIn,
  isValid,
  days,
  startDateValue,
  endDateValue,
  startDateLabel,
  endDateLabel,
}: {
  carId: string;
  pricePerDay: number;
  isSignedIn: boolean;
  isValid: boolean;
  days: number;
  startDateValue: string;
  endDateValue: string;
  startDateLabel: string;
  endDateLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setDate(key: "startDate" | "endDate", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-ember/40 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
        <CalendarBlank size={16} aria-hidden="true" />
        Book this car
      </h2>

      <div className="flex flex-wrap items-end gap-3">
        <CompactDateField
          label="Pick-up date"
          value={startDateValue}
          onChange={(value) => setDate("startDate", value)}
        />
        <CompactDateField
          label="Return date"
          value={endDateValue}
          min={startDateValue || undefined}
          onChange={(value) => setDate("endDate", value)}
        />
      </div>

      {isValid ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-mist pt-3 text-sm">
            <span className="text-gray-600">
              {startDateLabel} – {endDateLabel} ({days} days)
            </span>
            <span className="font-semibold">
              ${(pricePerDay * days).toFixed(2)} total
            </span>
          </div>

          {isSignedIn ? (
            <BookingForm
              carId={carId}
              startDate={startDateValue}
              endDate={endDateValue}
            />
          ) : (
            <Link
              href="/login"
              className="rounded bg-ember px-4 py-2 text-center text-charcoal transition-colors hover:bg-rust hover:text-white"
            >
              Sign in to book this car
            </Link>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">Pick your dates to book this car.</p>
      )}
    </div>
  );
}

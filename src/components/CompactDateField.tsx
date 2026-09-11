"use client";

import { useRef } from "react";
import { CalendarBlank } from "@phosphor-icons/react";
import { inputClassName, datePlaceholderClassName } from "@/lib/formStyles";

// Extracted out of CarFilters once BookingSection needed the exact same
// field (label + native date input + icon button opening the OS picker,
// muted placeholder) — one shared implementation for the two places on
// the site that just need a plain compact date field, rather than
// copy-pasting this a second time.
export function CompactDateField({
  label,
  value,
  onChange,
  min,
  // Defaults to a real width rather than "" — iOS Safari's native date
  // input doesn't reliably shrink to fit an unconstrained flex parent
  // (this is exactly what shipped broken on the booking page: a caller
  // that forgot to pass this rendered the input at Safari's own
  // preferred intrinsic width instead of the card's). A caller can still
  // override it, but there's no longer an unconstrained default to fall
  // into by omission.
  className = "w-full sm:w-auto",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <label className={`flex min-w-0 flex-col gap-1 text-sm ${className}`}>
      {label}
      {/* overflow-hidden is a clipping safety net, not the primary fix —
          if Safari ever paints this native control wider than the box
          above assigns it, this keeps that contained instead of it
          spilling into the page and reintroducing the horizontal
          "wiggle" scroll. */}
      <div className="relative min-w-0 overflow-hidden">
        <input
          ref={ref}
          type="date"
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0 ${datePlaceholderClassName} ${inputClassName}`}
        />
        <button
          type="button"
          onClick={() => ref.current?.showPicker?.()}
          aria-label={`Open ${label.toLowerCase()} calendar`}
          className="absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 hover:text-rust"
        >
          <CalendarBlank size={16} aria-hidden="true" />
        </button>
      </div>
    </label>
  );
}

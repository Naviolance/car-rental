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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <div className="relative">
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

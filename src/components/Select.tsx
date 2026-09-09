"use client";

import { CaretDown } from "@phosphor-icons/react";
import { inputClassName } from "@/lib/formStyles";

// A styled wrapper around the native <select> — appearance-none strips
// the browser's own dropdown chrome (which read as dated next to every
// other restyled control), replaced with our own CaretDown so every
// select in the app matches instead of falling back to whatever the OS
// renders by default. Still a real <select> underneath — keyboard nav,
// native option list, and form submission all work exactly as before.
export function Select({
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none pr-8 ${inputClassName} ${className}`}
      />
      <CaretDown
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

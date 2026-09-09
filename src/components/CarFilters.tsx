"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarBlank } from "@phosphor-icons/react";
import { CarCategory, Transmission, FuelType } from "@/generated/prisma/enums";
import { inputClassName, datePlaceholderClassName } from "@/lib/formStyles";
import { Select } from "./Select";

// Client Component only for the controls themselves — the actual query
// still happens server-side in CarsPage, re-reading searchParams on every
// navigation this triggers. This component never talks to Prisma; it just
// edits the URL. Even if it sent garbage, CarsPage's own validation is
// still what decides what reaches the database.
export function CarFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickupRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);

  function navigate(params: URLSearchParams) {
    // replace, not push — tweaking a filter shouldn't fill up browser
    // history with one entry per selection.
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigate(params);
  }

  // Dropdowns fire onChange only on a discrete selection, so instant
  // navigation is the right feel. A number input fires on every keystroke,
  // so that one gets a debounce instead — otherwise "50" would trigger
  // three separate queries as "5", then "50".
  function setParamDebounced(key: string, value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam(key, value), 400);
  }

  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-mist p-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Category
          <Select
            defaultValue={searchParams.get("category") ?? ""}
            onChange={(e) => setParam("category", e.target.value)}
          >
            <option value="">All</option>
            {Object.values(CarCategory).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Transmission
          <Select
            defaultValue={searchParams.get("transmission") ?? ""}
            onChange={(e) => setParam("transmission", e.target.value)}
          >
            <option value="">All</option>
            {Object.values(Transmission).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Fuel type
          <Select
            defaultValue={searchParams.get("fuelType") ?? ""}
            onChange={(e) => setParam("fuelType", e.target.value)}
          >
            <option value="">All</option>
            {Object.values(FuelType).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Max price / day
          <input
            type="number"
            min={0}
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onChange={(e) => setParamDebounced("maxPrice", e.target.value)}
            placeholder="Any"
            className={`w-28 ${inputClassName}`}
          />
        </label>

        {/* Plain date fields, not the full calendar popover this used to
            open — the dates here only narrow the list (and get carried
            forward to prefill the car detail page's own picker), they
            aren't the actual booking step, so they don't need the same
            visual weight as a real date-of-booking picker. Matches the
            other filters here: one compact control each, no extra
            interaction to reveal them. */}
        <label className="flex flex-col gap-1 text-sm">
          Pick-up date
          <div className="relative">
            <input
              ref={pickupRef}
              type="date"
              value={startDate}
              onChange={(e) => setParam("startDate", e.target.value)}
              className={`w-full pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0 ${datePlaceholderClassName} ${inputClassName}`}
            />
            <button
              type="button"
              onClick={() => pickupRef.current?.showPicker?.()}
              aria-label="Open pick-up date calendar"
              className="absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 hover:text-rust"
            >
              <CalendarBlank size={16} aria-hidden="true" />
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Return date
          <div className="relative">
            <input
              ref={returnRef}
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setParam("endDate", e.target.value)}
              className={`w-full pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0 ${datePlaceholderClassName} ${inputClassName}`}
            />
            <button
              type="button"
              onClick={() => returnRef.current?.showPicker?.()}
              aria-label="Open return date calendar"
              className="absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 hover:text-rust"
            >
              <CalendarBlank size={16} aria-hidden="true" />
            </button>
          </div>
        </label>

        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="text-sm text-gray-500 underline"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarBlank } from "@phosphor-icons/react";
import { CarCategory, Transmission, FuelType } from "@/generated/prisma/enums";
import { inputClassName } from "@/lib/formStyles";
import { Select } from "./Select";
import { DateRangeField } from "./DateRangeField";

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
  const datePopoverRef = useRef<HTMLDivElement>(null);
  // Defaults open if a date range is already in the URL (e.g. forwarded
  // from the finder wizard or a previous visit), so it's never hidden
  // right when it's actually relevant.
  const [showDates, setShowDates] = useState(() =>
    Boolean(searchParams.get("startDate"))
  );

  // The date picker used to render inline, shoving the car grid down a
  // full calendar's height every time someone opened it — this is what
  // turns it into a floating popover instead: closes on an outside click
  // or Escape, same pattern the Dropdown component already uses.
  useEffect(() => {
    if (!showDates) return;
    function handlePointerDown(event: MouseEvent) {
      if (!datePopoverRef.current?.contains(event.target as Node)) {
        setShowDates(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowDates(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDates]);

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

      <div ref={datePopoverRef} className="relative">
        <button
          type="button"
          onClick={() => setShowDates((v) => !v)}
          className="flex items-center gap-1.5 text-sm underline"
        >
          {!showDates && <CalendarBlank size={16} aria-hidden="true" />}
          {showDates
            ? "Hide dates"
            : searchParams.get("startDate")
              ? "Edit dates"
              : "Pick your dates"}
        </button>

        {showDates && (
          <div className="absolute left-0 top-full z-20 mt-2 w-max min-w-[300px] rounded border border-mist bg-white p-4 shadow-lg">
            <DateRangeField />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          setShowDates(false);
          router.replace(pathname, { scroll: false });
        }}
        className="text-sm text-gray-500 underline"
      >
        Reset
      </button>
      </div>
    </div>
  );
}

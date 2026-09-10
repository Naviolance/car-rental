"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CarCategory, Transmission, FuelType } from "@/generated/prisma/enums";
import { inputClassName } from "@/lib/formStyles";
import { Select } from "./Select";
import { CompactDateField } from "./CompactDateField";

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
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex w-full flex-col gap-1 text-sm sm:w-auto">
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

        <label className="flex w-full flex-col gap-1 text-sm sm:w-auto">
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

        <label className="flex w-full flex-col gap-1 text-sm sm:w-auto">
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

        <label className="flex w-full flex-col gap-1 text-sm sm:w-auto">
          Max price / day
          <input
            type="number"
            min={0}
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onChange={(e) => setParamDebounced("maxPrice", e.target.value)}
            placeholder="Any"
            className={`w-full sm:w-28 ${inputClassName}`}
          />
        </label>

        {/* Plain date fields, not the full calendar popover this used to
            open — the dates here only narrow the list (and get carried
            forward to prefill the car detail page's own picker), they
            aren't the actual booking step, so they don't need the same
            visual weight as a real date-of-booking picker. Matches the
            other filters here: one compact control each, no extra
            interaction to reveal them. */}
        <CompactDateField
          label="Pick-up date"
          value={startDate}
          onChange={(value) => setParam("startDate", value)}
          className="w-full sm:w-auto"
        />
        <CompactDateField
          label="Return date"
          value={endDate}
          min={startDate || undefined}
          onChange={(value) => setParam("endDate", value)}
          className="w-full sm:w-auto"
        />

        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="self-start text-sm text-gray-500 underline sm:self-auto"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

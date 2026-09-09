"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fromDateString, toDateString } from "@/lib/dateOnly";
import { DateRangePicker } from "./DateRangePicker";

function daysBetween(startIso: string, endIso: string): number {
  const diff = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 86_400_000
  );
  return diff > 0 ? diff : 3;
}

// Wraps DateRangePicker with "read the current range from the URL, write
// changes straight back to it" — the one thing every place dates can be
// picked (the /cars filters, the car detail page) needs, so neither has
// to reimplement it.
export function DateRangeField() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlStartDate = searchParams.get("startDate") ?? "";
  const urlEndDate = searchParams.get("endDate") ?? "";

  const [startDate, setStartDate] = useState(urlStartDate);
  const [days, setDays] = useState(
    urlStartDate && urlEndDate ? daysBetween(urlStartDate, urlEndDate) : 3
  );

  function commit(nextStartDate: string, nextDays: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (!nextStartDate || nextDays <= 0) {
      params.delete("startDate");
      params.delete("endDate");
    } else {
      const start = fromDateString(nextStartDate);
      const end = new Date(start);
      end.setDate(end.getDate() + nextDays);
      params.set("startDate", toDateString(start));
      params.set("endDate", toDateString(end));
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <DateRangePicker
      startDate={startDate}
      days={days}
      onStartDateChange={(value) => {
        setStartDate(value);
        commit(value, days);
      }}
      onDaysChange={(value) => {
        setDays(value);
        commit(startDate, value);
      }}
    />
  );
}

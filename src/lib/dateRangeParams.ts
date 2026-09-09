import { fromDateString, toDateString } from "@/lib/dateOnly";

// Shared between /cars (applies the availability filter) and /cars/[id]
// (shows the carried-forward selection and advances the step tracker) —
// one parsing implementation so the two pages can't quietly disagree on
// what counts as a valid date range.
export function parseDateParam(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = fromDateString(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

// A discriminated union, not a plain `{ isValid: boolean }` — checking
// `.isValid` on the same object then narrows `.startDate`/`.endDate` from
// `Date | undefined` to `Date` at every call site, rather than only where
// this was originally written inline.
export type DateRangeResult =
  | { isValid: true; startDate: Date; endDate: Date }
  | { isValid: false; startDate: undefined; endDate: undefined };

export function parseDateRange(
  startDateParam: string | undefined,
  endDateParam: string | undefined
): DateRangeResult {
  const startDate = parseDateParam(startDateParam);
  const endDate = parseDateParam(endDateParam);
  if (startDate && endDate && startDate < endDate) {
    return { isValid: true, startDate, endDate };
  }
  return { isValid: false, startDate: undefined, endDate: undefined };
}

// For forwarding a validated range onto another page's links (e.g. a car
// card's href) without re-encoding raw, unvalidated query-string input.
export function dateRangeQueryString(
  startDate: Date | undefined,
  endDate: Date | undefined
): string {
  if (!startDate || !endDate) return "";
  const params = new URLSearchParams();
  params.set("startDate", toDateString(startDate));
  params.set("endDate", toDateString(endDate));
  return params.toString();
}

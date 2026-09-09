// Converts between a Date and a "YYYY-MM-DD" string using the LOCAL
// calendar day the Date represents — never toISOString(), which is
// UTC-based and silently shifts the date by a day for anyone in a
// positive UTC offset (most of Europe, Africa, Asia, Australia): local
// midnight for "Sep 14" is UTC "Sep 13 22:00", so .toISOString() reports
// the wrong day. Every date in this app is a calendar day a user picked,
// not a timestamp — this pair is what keeps that distinction from
// leaking into a real off-by-one booking bug.
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// The inverse: builds a Date at local midnight for a "YYYY-MM-DD" string
// via the numeric Date constructor (always local time), not string
// parsing — a date-only string ("2026-09-14") parses as UTC per spec,
// but "2026-09-14T00:00:00" (no zone) parses as local time. Mixing those
// two parsing rules for what's meant to be the same value is exactly
// how this bug happens.
export function fromDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

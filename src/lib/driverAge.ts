export const MIN_DRIVER_AGE = 18;
export const MAX_DRIVER_AGE = 80;

// Shared between the homepage search form and the booking form — one
// list so the two can't quietly drift into offering a different age
// range. Every option is already >= MIN_DRIVER_AGE, so there's no invalid
// choice to pick from the dropdown itself; createBooking still validates
// the submitted value independently, since a direct POST can skip the
// dropdown entirely.
export const AGE_OPTIONS = Array.from(
  { length: MAX_DRIVER_AGE - MIN_DRIVER_AGE + 1 },
  (_, i) => {
    const age = String(MIN_DRIVER_AGE + i);
    return { value: age, label: age };
  }
);

export function isValidDriverAge(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const age = Number(value);
  return Number.isInteger(age) && age >= MIN_DRIVER_AGE && age <= MAX_DRIVER_AGE;
}

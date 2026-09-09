// Shared between LoginForm and RegisterForm's text inputs — a
// rust-tinted focus ring instead of the browser's default (usually
// blue) outline, so focusing an input doesn't visually contradict the
// rest of the palette.
export const inputClassName =
  "rounded border border-mist px-3 py-2 outline-none transition-colors focus:border-rust focus:ring-2 focus:ring-rust/20";

// Every `type="date"` input on the site pairs with this. An empty date
// input renders "dd/mm/yyyy" in the same dark text color as a real
// value, which makes an untouched field look filled in — this is what
// actually makes it "blend with the field" as a muted placeholder
// instead. WebKit is the only engine that exposes these segments as
// individually stylable pseudo-elements, and marks an unset segment
// :invalid, which is what lets this target only the placeholder state
// and not text the user actually typed.
export const datePlaceholderClassName =
  "[&::-webkit-datetime-edit-day-field:invalid]:text-gray-400 [&::-webkit-datetime-edit-month-field:invalid]:text-gray-400 [&::-webkit-datetime-edit-year-field:invalid]:text-gray-400 [&::-webkit-datetime-edit-text]:text-gray-400";

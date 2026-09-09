// Shared between LoginForm and RegisterForm's text inputs — a
// rust-tinted focus ring instead of the browser's default (usually
// blue) outline, so focusing an input doesn't visually contradict the
// rest of the palette.
export const inputClassName =
  "rounded border border-mist px-3 py-2 outline-none transition-colors focus:border-rust focus:ring-2 focus:ring-rust/20";

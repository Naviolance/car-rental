// Rounds to the nearest whole star for display — a plain text/unicode
// rendering rather than an icon library, consistent with how the rest of
// this app uses simple unicode symbols (✓, ✕) instead of adding an icon
// dependency for a handful of glyphs.
export function starString(rating: number): string {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

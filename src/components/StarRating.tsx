import { starString } from "@/lib/rating";

// Drop-in for `{starString(rating)}` wherever it was used directly — the
// glyph string alone gave screen readers nothing (AT symbol-verbosity
// settings vary widely on how "★★★★☆" gets announced, from the literal
// character names to silence). aria-hidden on the glyphs plus a real
// sr-only number is what actually says "4.3 out of 5 stars."
export function StarRating({ rating }: { rating: number }) {
  return (
    <>
      <span aria-hidden="true">{starString(rating)}</span>
      <span className="sr-only">{`Rated ${rating.toFixed(1)} out of 5`}</span>
    </>
  );
}

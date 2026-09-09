"use client";

import { MotionConfig, motion } from "motion/react";
import { Lightning, CheckCircle, Tag, Car } from "@phosphor-icons/react";

const features = [
  {
    slug: "instant-confirmation",
    icon: Lightning,
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
    title: "Instant confirmation",
    body: "No calls, no waiting on a quote — book online and get a confirmation right away.",
  },
  {
    slug: "verified-availability",
    icon: CheckCircle,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Verified availability",
    body: "Every booking is checked against real reservations, so you never get double-booked.",
  },
  {
    slug: "transparent-pricing",
    icon: Tag,
    bg: "bg-green-50",
    iconColor: "text-green-700",
    title: "Transparent pricing",
    body: "The daily rate you see is what you pay — the total is calculated up front, no surprises.",
  },
  {
    slug: "wide-selection",
    icon: Car,
    bg: "bg-purple-50",
    iconColor: "text-purple-700",
    title: "Wide selection",
    body: "Economy to luxury, automatic or manual — filter by what actually matters to you.",
  },
];

// A plain <a>, not next/link's <Link>: Link does its own internal
// scrollIntoView-based navigation for hash hrefs, and — like the
// browser's native hash handling — Next's router treats navigating to
// the URL's *already-current* hash as a no-op, silently skipping that
// scroll step on a repeat click (scroll back up, click the same card
// again → nothing happens). A plain <a> has no such routing layer, so
// only this handler runs: it scrolls by hand on every click regardless
// of whether the hash is actually changing. replaceState (not
// pushState) keeps clicking the same card twice from stacking up
// browser-history entries for what's really one destination.
function scrollToSlug(event: React.MouseEvent, slug: string) {
  const target = document.getElementById(slug);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${slug}`);
}

export function WhyBookSection() {
  return (
    <MotionConfig reducedMotion="user">
    <section className="px-6">
      <h2 className="text-center text-xl font-semibold">Why book with us</h2>
      {/* A horizontally scrollable strip, not a wrapping grid — the cards
          are taller now (more vertical padding), and letting the row
          scroll instead of wrapping to 2+ rows keeps the section compact
          on narrow screens where four taller cards wouldn't fit in one
          row. snap-x/snap-start gives each card a resting position
          instead of stopping mid-card. -mx-6/px-6 lets the scroll area
          bleed to the same edge "Available cars" below sits at. No
          scroll-triggered entrance here: the hero's load animation is
          this page's one deliberate motion moment, so these tiles just
          get a hover response (functional feedback, not decoration).
          justifyContent: "safe center" as an inline style, not a
          Tailwind class — Tailwind's arbitrary-value validator rejects
          the two-keyword "safe center" syntax for justify-*, so this
          has to bypass class generation entirely. The effect: when the
          row fits without scrolling (desktop), it centers instead of
          hugging the left edge; when it overflows (mobile), "safe"
          falls back to start-aligned so the first card stays reachable
          by scrolling — plain center on an overflowing flex container
          clips the start instead of letting you scroll to it. */}
      <div
        className="-mx-6 mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2"
        style={{ justifyContent: "safe center" }}
      >
        {features.map((feature) => (
          // Each card *is* the anchor to its own elaboration in
          // WhyUsSection below the fleet — these tiles and that
          // section cover the same four things, so the tile a person
          // is already looking at is the natural link, not a single
          // generic link floating near the heading above all four.
          <a
            key={feature.slug}
            href={`#${feature.slug}`}
            onClick={(event) => scrollToSlug(event, feature.slug)}
            className="w-56 shrink-0 snap-start"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex flex-col items-center gap-3 rounded-lg border border-transparent p-6 text-center transition-shadow hover:z-10 hover:border-mist hover:shadow-md"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bg}`}
              >
                <feature.icon
                  size={24}
                  weight="regular"
                  className={feature.iconColor}
                  aria-hidden="true"
                />
              </span>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.body}</p>
            </motion.div>
          </a>
        ))}
      </div>
    </section>
    </MotionConfig>
  );
}

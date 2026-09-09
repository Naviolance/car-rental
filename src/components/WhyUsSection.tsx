"use client";

import { MotionConfig, motion } from "motion/react";

// A Client Component now — the scroll-triggered reveal below needs it.
// This is the elaborated counterpart to WhyBookSection's teaser strip
// above the fleet: same four titles, each expanded into an actual
// article with a real fleet photo alongside it rather than a generic
// icon — grounding the section in the actual product (real cars this
// site rents) instead of abstract iconography standing in for it.
//
// This is the one section on the page that breaks from "the hero's load
// animation is the only deliberate motion moment" — added back in on
// request. To keep it from reading as the generic uniform
// fade-everything-up pattern that principle exists to avoid, each
// article's slide direction is tied to which side its own image sits
// on (left-image articles slide in from the left, right-image from the
// right) instead of every block doing the same thing. MotionConfig's
// reducedMotion="user" disables all of it for anyone whose OS is set to
// reduce motion — motion/react doesn't do that automatically, so it has
// to be requested explicitly for this to be genuinely optional.
//
// The background is a hand-computed blend of the palette's maroon and
// charcoal (40% maroon / 60% charcoal → #450e16, not a color-mix()
// runtime function, so its exact value stays auditable at a glance) —
// flat maroon read as too bright/loud for this section; blending it
// most of the way to charcoal keeps a warm, wine-toned identity without
// shouting. The blend into the actual (charcoal) footer below is a
// separate thin fade pinned to the very bottom, not the section's own
// background — a gradient spanning the whole section faded the last
// article to near-black, so that's kept as a short, confined strip.
const details = [
  {
    slug: "instant-confirmation",
    title: "Instant confirmation",
    body: "The moment you submit a request, it's checked against every other booking for that car in real time — so you find out right away if the dates work, instead of waiting on a call back. A booking shows as pending until it's reviewed, but you already know it didn't collide with anyone else's reservation.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg/3840px-Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg",
    imageAlt: "Tesla Model 3",
  },
  {
    slug: "verified-availability",
    title: "Verified availability",
    body: "Every date range you see is checked against real bookings, not a calendar someone forgot to update. Two people can't both walk away thinking they've got the same car on the same day.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2019_BMW_X5_M50d_Automatic_3.0.jpg/3840px-2019_BMW_X5_M50d_Automatic_3.0.jpg",
    imageAlt: "BMW X5",
  },
  {
    slug: "transparent-pricing",
    title: "Transparent pricing",
    body: "The daily rate on a listing is the rate you pay — multiplied by the number of days and shown as a total before you ever submit a booking. No processing fee, no line item that shows up at pickup.",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Ford_Mustang_VII_GT_Rutesheimer_Autoschau_2025_DSC_9234.jpg/3840px-Ford_Mustang_VII_GT_Rutesheimer_Autoschau_2025_DSC_9234.jpg",
    imageAlt: "Ford Mustang",
  },
  {
    slug: "wide-selection",
    title: "Wide selection",
    body: "Filter the fleet by category, transmission, fuel type, or price — from economy runabouts to executive sedans and full-size vans. If you know what you need, you can narrow down to it in a couple of clicks.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2019_Mercedes-Benz_Sprinter_314_CDi_2.1.jpg/3840px-2019_Mercedes-Benz_Sprinter_314_CDi_2.1.jpg",
    imageAlt: "Mercedes-Benz Sprinter",
  },
];

export function WhyUsSection() {
  return (
    <section className="relative bg-[#450e16] px-6 py-16 text-cream">
      <MotionConfig reducedMotion="user">
        <div className="mx-auto flex max-w-4xl flex-col gap-16">
          {details.map((detail, index) => {
            const imageOnLeft = index % 2 === 0;
            return (
              <motion.article
                key={detail.slug}
                id={detail.slug}
                initial={{ opacity: 0, x: imageOnLeft ? -32 : 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                // A clicked anchor (the WhyBookSection cards) jumps
                // straight here — the article sits fully invisible
                // until the browser's own scroll lands, so a high
                // visibility threshold plus a slow transition stacked
                // on top of that read as the anchor being broken, not
                // animated. amount: 0 fires as soon as even one pixel
                // is on screen instead of waiting for 30% of it.
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex scroll-mt-6 flex-col items-center gap-8 sm:flex-row ${
                  !imageOnLeft ? "sm:flex-row-reverse" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- external hotlinked Wikimedia photo, same as every other fleet image on the site */}
                <img
                  src={detail.image}
                  alt={detail.imageAlt}
                  className="aspect-[4/3] w-full shrink-0 rounded-lg object-cover sm:w-2/5"
                />
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold text-ember">
                    {detail.title}
                  </h3>
                  <p className="text-mist">{detail.body}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </MotionConfig>

      {/* The actual blend into the footer: a short fade from transparent
          (revealing the section's own background) down to the exact
          charcoal the footer starts at, so the two backgrounds meet
          without a hard line — confined to this strip instead of
          spanning the section. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-charcoal"
      />
    </section>
  );
}

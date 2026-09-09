"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Car } from "@/generated/prisma/client";
import { StarRating } from "@/components/StarRating";

export function CarCard({
  car,
  queryString = "",
  avgRating,
  reviewCount,
}: {
  // Not the raw Prisma Car: pricePerDay there is a Decimal instance, and
  // Server Components can only pass plain serializable values to Client
  // Components (this is one — it needs motion). Callers convert with
  // Number(car.pricePerDay) before passing it down.
  car: Omit<Car, "pricePerDay"> & { pricePerDay: number };
  // Forwards a date range picked upstream (the finder wizard, or a filter
  // on /cars) onto the detail page, so it doesn't just evaporate the
  // moment the user clicks into a specific car.
  queryString?: string;
  // Both optional and independent of the Car type itself — a rating is
  // an aggregate over Review rows, not a column on Car, so callers that
  // haven't computed it (or a car with zero reviews) simply omit these.
  avgRating?: number;
  reviewCount?: number;
}) {
  // Only a hover response, not a scroll-triggered entrance: that fade/
  // slide-up-on-scroll treatment is one of the most common AI-generated
  // design tells, and it would be scattered here across every card in
  // the grid rather than one deliberate moment. The hero's entrance
  // animation is the one orchestrated motion moment on this page; this
  // is just feedback that the card is clickable.
  return (
    <motion.div whileHover={{ y: -6 }} className="h-full">
      <Link
        href={`/cars/${car.id}${queryString ? `?${queryString}` : ""}`}
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-mist bg-white transition-shadow hover:shadow-lg"
      >
        <div className="h-44 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- external
              hotlinked seed images; swapping to next/image once cars come from
              Supabase Storage uploads (roadmap step 6) rather than Unsplash URLs */}
          <img
            src={car.imageUrl}
            alt={`${car.make} ${car.model}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {car.make} {car.model}
            </h3>
            <span className="text-xs text-gray-500">{car.year}</span>
          </div>
          {Boolean(reviewCount) && avgRating !== undefined && (
            <p className="text-xs text-rust">
              <StarRating rating={avgRating} />{" "}
              <span className="text-gray-500">({reviewCount})</span>
            </p>
          )}
          <div className="flex gap-2 text-xs text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-0.5">
              {car.category}
            </span>
            <span className="rounded bg-gray-100 px-2 py-0.5">
              {car.transmission}
            </span>
          </div>
          <p className="mt-1 font-medium">
            ${car.pricePerDay.toFixed(2)}
            <span className="font-normal text-gray-500"> / day</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

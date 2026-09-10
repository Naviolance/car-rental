"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MotionConfig, motion, type Variants } from "motion/react";
import { CalendarBlank } from "@phosphor-icons/react";
import { CarCategory } from "@/generated/prisma/enums";
import { inputClassName, datePlaceholderClassName } from "@/lib/formStyles";
import { toDateString } from "@/lib/dateOnly";
import { Dropdown } from "@/components/Dropdown";

// Parent only orchestrates timing (staggerChildren) — it has no visual
// state of its own, so its variants are empty objects.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Half-hour slots, 6:00 AM–10:00 PM — a dropdown of real rental-counter
// hours reads as a rental-site search widget; a bare <input type="time">
// would bring back the same native-picker dated-ness already fixed for
// the date fields.
const TIME_SLOTS = Array.from({ length: 33 }, (_, i) => {
  const totalMinutes = 6 * 60 + i * 30;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const value = `${String(hours24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const label = `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  return { value, label, totalMinutes };
});

const AGE_OPTIONS = Array.from({ length: 63 }, (_, i) => {
  const age = String(18 + i);
  return { value: age, label: age };
});

const CATEGORY_OPTIONS = [
  { value: "", label: "Any" },
  ...Object.values(CarCategory).map((value) => ({ value, label: value })),
];

// A date's paired time dropdown only needs past slots disabled when that
// date is today — any other date has no relationship to the clock at
// all. `toDateString` (local-calendar-day, not UTC) is the same utility
// the rest of the app already uses to avoid the timezone off-by-one bug,
// so "today" here means the same thing it means everywhere else.
function timeOptionsFor(dateValue: string) {
  const isToday = dateValue === toDateString(new Date());
  const nowMinutes = isToday
    ? new Date().getHours() * 60 + new Date().getMinutes()
    : -1;
  return TIME_SLOTS.map(({ value, label, totalMinutes }) => ({
    value,
    label,
    disabled: isToday && totalMinutes <= nowMinutes,
  }));
}

// The hero's static wrapper (bg-rust section, text color) stays in the
// Server Component that renders this — page.tsx queries Prisma and
// can't itself use motion, but nothing here needs the database.
export function HeroContent() {
  const pickupRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("10:00");
  const [driverAge, setDriverAge] = useState("");

  // Picking today's date can leave the currently-selected time slot in
  // the past (e.g. the "10:00 AM" default, at 2 PM) — bump it forward to
  // the next available slot. Done here, during render, rather than in a
  // useEffect: this is React's documented pattern for "adjust state when
  // a prop/other state changes" (comparing against a value from the
  // previous render and calling setState conditionally), which avoids
  // committing a frame with the stale value before an effect corrects it.
  const [prevPickupDate, setPrevPickupDate] = useState(pickupDate);
  if (pickupDate !== prevPickupDate) {
    setPrevPickupDate(pickupDate);
    const options = timeOptionsFor(pickupDate);
    if (options.find((option) => option.value === pickupTime)?.disabled) {
      setPickupTime(options.find((option) => !option.disabled)?.value ?? "");
    }
  }

  const [prevReturnDate, setPrevReturnDate] = useState(returnDate);
  if (returnDate !== prevReturnDate) {
    setPrevReturnDate(returnDate);
    const options = timeOptionsFor(returnDate);
    if (options.find((option) => option.value === returnTime)?.disabled) {
      setReturnTime(options.find((option) => !option.disabled)?.value ?? "");
    }
  }

  return (
    <MotionConfig reducedMotion="user">
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="flex flex-col items-center gap-4 text-center"
    >
      <motion.h1 variants={item} className="text-4xl font-bold">
        Rent the right car, right now
      </motion.h1>
      <motion.p variants={item} className="max-w-md text-cream/80">
        Browse the fleet below and book by the day — no hidden fees, no
        hassle.
      </motion.p>

      <motion.form
        variants={item}
        action="/cars"
        method="get"
        className="mt-2 flex w-full max-w-3xl flex-wrap items-end justify-center gap-3 rounded-lg bg-white p-4 text-left text-charcoal shadow-xl"
      >
        <label className="flex flex-col gap-1 text-sm">
          Category
          <Dropdown
            name="category"
            ariaLabel="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            className="w-32"
          />
        </label>
        <div className="flex flex-col gap-1 text-sm">
          Pick-up
          {/* The native date input's own text-segment editing (click
              into it and each of mm/dd/yyyy highlights individually) is
              what read as dated — hiding its built-in picker icon and
              opening the OS date picker from our own CalendarBlank
              button instead keeps that same native picker (still no
              custom calendar to build or maintain) but makes clicking
              it the obvious, single interaction instead of stumbling
              into segment-editing mode. */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <input
                ref={pickupRef}
                type="date"
                name="startDate"
                aria-label="Pick-up date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className={`w-full pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0 ${datePlaceholderClassName} ${inputClassName}`}
              />
              <button
                type="button"
                onClick={() => pickupRef.current?.showPicker?.()}
                aria-label="Open pick-up date calendar"
                className="absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 hover:text-rust"
              >
                <CalendarBlank size={16} aria-hidden="true" />
              </button>
            </div>
            <Dropdown
              name="startTime"
              ariaLabel="Pick-up time"
              options={timeOptionsFor(pickupDate)}
              value={pickupTime}
              onChange={setPickupTime}
              className="w-full sm:w-28"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          Return
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <input
                ref={returnRef}
                type="date"
                name="endDate"
                aria-label="Return date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className={`w-full pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0 ${datePlaceholderClassName} ${inputClassName}`}
              />
              <button
                type="button"
                onClick={() => returnRef.current?.showPicker?.()}
                aria-label="Open return date calendar"
                className="absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 hover:text-rust"
              >
                <CalendarBlank size={16} aria-hidden="true" />
              </button>
            </div>
            <Dropdown
              name="endTime"
              ariaLabel="Return time"
              options={timeOptionsFor(returnDate)}
              value={returnTime}
              onChange={setReturnTime}
              className="w-full sm:w-28"
            />
          </div>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Driver&apos;s age
          {/* Not enforced anywhere yet — /cars and the booking flow
              don't read this. It's here so the widget matches a real
              rental search (every major rental site gates on this),
              with the actual 18+ validation left for when it's wired
              into booking creation. Every listed option is already
              18+, so there's no invalid choice to pick in the first
              place — unlike the old free-number input's min={18},
              which only warned after a smaller value was typed. */}
          <Dropdown
            name="driverAge"
            ariaLabel="Driver's age"
            options={AGE_OPTIONS}
            value={driverAge}
            onChange={setDriverAge}
            placeholder="18+"
            className="w-20"
          />
        </label>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="rounded bg-ember px-5 py-2.5 font-medium text-charcoal transition-colors hover:bg-rust hover:text-white"
        >
          Search
        </motion.button>
      </motion.form>

      <motion.div variants={item}>
        <Link href="/cars" className="text-sm text-cream/80 underline">
          Or just browse everything
        </Link>
      </motion.div>
    </motion.div>
    </MotionConfig>
  );
}

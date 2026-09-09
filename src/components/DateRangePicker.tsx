"use client";

import { useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { CalendarBlank } from "@phosphor-icons/react";
import { inputClassName, datePlaceholderClassName } from "@/lib/formStyles";
import { fromDateString, toDateString } from "@/lib/dateOnly";

export function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

// Purely a controlled input: the parent owns startDate/days and decides
// what happens on change (the wizard holds them in local state until a
// final submit; CarFilters and the car detail page push them straight
// into the URL). This is the one place the "type it or click the
// calendar, either way, never a past date" behavior is implemented, so
// every place dates can be picked behaves identically.
export function DateRangePicker({
  startDate,
  days,
  onStartDateChange,
  onDaysChange,
}: {
  startDate: string;
  days: number;
  onStartDateChange: (value: string) => void;
  onDaysChange: (value: number) => void;
}) {
  const [dateError, setDateError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const today = startOfToday();
  const todayString = toDateString(today);

  function handleNativeDateChange(value: string) {
    if (!value) {
      onStartDateChange("");
      setDateError(null);
      return;
    }
    const picked = fromDateString(value);
    if (picked < today) {
      setDateError("You can't select a date earlier than today.");
      return;
    }
    setDateError(null);
    onStartDateChange(value);
  }

  function handleCalendarSelect(date: Date | undefined) {
    if (!date) return;
    // The calendar's own `disabled` matcher already prevents clicking a
    // past day, so reaching this point with a valid date is the norm —
    // this branch exists for defense in depth, not because it's expected.
    if (date < today) {
      setDateError("You can't select a date earlier than today.");
      return;
    }
    setDateError(null);
    onStartDateChange(toDateString(date));
  }

  const selectedStart = startDate ? fromDateString(startDate) : undefined;
  // The end of the rental period, purely for display — clicking still
  // only ever sets the start date (days is a separate typed number), but
  // the calendar should still show the span that produces, not just the
  // one day you clicked. Without this a "date range" picker was visually
  // indistinguishable from a single-date one.
  const selectedEnd =
    selectedStart && days > 0
      ? (() => {
          const end = new Date(selectedStart);
          end.setDate(end.getDate() + days - 1);
          return end;
        })()
      : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Pick-up date
          {/* Same fix as the hero search form: hide the browser's own
              picker indicator and open it from our own icon instead, so
              this doesn't fall back to the native mm/dd/yyyy
              segment-editing behavior — this component is what every
              other date field on the site actually renders through
              (the hero form is the one exception, styled to match by
              hand), so fixing it here is what makes the fix universal. */}
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              min={todayString}
              value={startDate}
              onChange={(e) => handleNativeDateChange(e.target.value)}
              aria-invalid={Boolean(dateError)}
              aria-describedby={dateError ? errorId : undefined}
              className={`w-full pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0 ${datePlaceholderClassName} ${inputClassName}`}
            />
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker?.()}
              aria-label="Open pick-up date calendar"
              className="absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400 hover:text-rust"
            >
              <CalendarBlank size={16} aria-hidden="true" />
            </button>
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Days
          <input
            type="number"
            min={1}
            value={days}
            onChange={(e) => onDaysChange(Number(e.target.value))}
            className={`w-20 ${inputClassName}`}
          />
        </label>
      </div>

      {dateError && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {dateError}
        </p>
      )}

      <div className="flex justify-center rounded border border-mist p-2">
        <DayPicker
          mode="single"
          // No `month`/`defaultMonth` override — DayPicker's own default
          // is "the current month," which is exactly what keeps this
          // anchored to the real current year rather than drifting to
          // some arbitrary default.
          selected={selectedStart}
          onSelect={handleCalendarSelect}
          disabled={{ before: today }}
          modifiers={
            selectedStart && selectedEnd
              ? { range: { from: selectedStart, to: selectedEnd } }
              : undefined
          }
          modifiersStyles={{
            range: { backgroundColor: "#f7e4da", borderRadius: 0 },
          }}
        />
      </div>
    </div>
  );
}

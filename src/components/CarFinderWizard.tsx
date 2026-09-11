"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "@phosphor-icons/react";
import { CarCategory, Transmission, FuelType } from "@/generated/prisma/enums";
import { Select } from "@/components/Select";
import { fromDateString, toDateString } from "@/lib/dateOnly";
import { DateRangePicker } from "./DateRangePicker";

const CATEGORY_LABELS: Record<CarCategory, string> = {
  ECONOMY: "Something light and efficient",
  COMPACT: "A comfortable everyday ride",
  SUV: "Space for the family or gear",
  LUXURY: "Something that turns heads",
  VAN: "Room for a group or cargo",
};

type Step = 1 | 2 | 3;

const DISMISSED_KEY = "carFinderWizardDismissed";

// A Client Component because it holds multi-step state as the user answers
// — the actual search still lands on /cars, reusing the filtering (and
// validation) that already lives there rather than duplicating a second
// query path. This is a guided front door to that page, not a separate
// system.
export function CarFinderWizard({ userName }: { userName?: string | null }) {
  const router = useRouter();
  // Starts closed — matches what the server rendered (there's no
  // localStorage during SSR), avoiding a hydration mismatch. A mount
  // effect below opens it once, only if this browser hasn't dismissed it
  // before. Popping up on every single visit to the homepage read as an
  // ad, not a helpful assistant — this is what fixes that.
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<CarCategory | null>(null);
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(3);

  // Same timezone/hydration reasoning as the isOpen effect above: default
  // to today only after mount, not during the render that produces the
  // initial HTML.
  useEffect(() => {
    setStartDate(toDateString(new Date()));
  }, []);
  const [transmission, setTransmission] = useState<Transmission | "">("");
  const [fuelType, setFuelType] = useState<FuelType | "">("");

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY) !== "true") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage doesn't exist during SSR, so this can only be known once mounted; a lazy useState initializer would read it during the client's first render instead and reintroduce the exact hydration mismatch this effect avoids.
        setIsOpen(true);
      }
    } catch {
      // Storage can throw (private browsing, disabled site data, etc.) —
      // fall back to just not auto-opening rather than crashing.
    }
  }, []);

  function dismiss() {
    setIsOpen(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // Same as above — a failed write just means it may pop up again
      // next visit, which is a minor inconvenience, not a bug worth
      // crashing over.
    }
  }

  // Escape closes the wizard, same as clicking the backdrop or the X.
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function chooseCategory(value: CarCategory | null) {
    setCategory(value);
    setStep(2);
  }

  function findCar() {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (transmission) params.set("transmission", transmission);
    if (fuelType) params.set("fuelType", fuelType);

    if (startDate && days > 0) {
      const start = fromDateString(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + days);
      params.set("startDate", toDateString(start));
      params.set("endDate", toDateString(end));
    }

    dismiss();
    router.push(`/cars?${params.toString()}`);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-ember px-5 py-3 text-sm text-charcoal shadow-lg transition-colors hover:bg-rust hover:text-white"
      >
        Find my car
      </button>
    );
  }

  return (
    // Clicking the backdrop itself closes the wizard; clicking inside the
    // card stops that click from bubbling up to the backdrop.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative mx-4 flex w-full max-w-lg flex-col gap-5 rounded-xl border border-mist bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
        >
          <X size={18} weight="bold" />
        </button>

        <div className="flex gap-1.5">
          {[1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={`h-1.5 flex-1 rounded-full ${
                dot <= step ? "bg-ember" : "bg-mist"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">
              {userName ? `Hey ${userName}, ` : "Hey there, "}
              what are you in the mood to drive today?
            </h2>
            <div className="flex flex-col gap-2">
              {Object.values(CarCategory).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => chooseCategory(value)}
                  className="rounded border border-mist px-4 py-2 text-left outline-none transition-colors hover:border-ember focus-visible:border-rust focus-visible:ring-2 focus-visible:ring-rust/20"
                >
                  {CATEGORY_LABELS[value]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => chooseCategory(null)}
                className="rounded px-4 py-2 text-left text-sm text-gray-500 underline"
              >
                Not sure — show me everything
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">
              When do you need it, and for how many days?
            </h2>

            <DateRangePicker
              startDate={startDate}
              days={days}
              onStartDateChange={setStartDate}
              onDaysChange={setDays}
            />

            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-500 underline"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-gray-500 underline"
              >
                {startDate ? "Continue" : "Skip — I'm flexible on dates"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">
              Any preference on transmission or fuel type — or don&apos;t
              sweat it?
            </h2>
            <label className="flex flex-col gap-1 text-sm">
              Transmission
              <Select
                value={transmission}
                onChange={(e) =>
                  setTransmission(e.target.value as Transmission | "")
                }
              >
                <option value="">No preference</option>
                {Object.values(Transmission).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Fuel type
              <Select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType | "")}
              >
                <option value="">No preference</option>
                {Object.values(FuelType).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </label>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-gray-500 underline"
              >
                Back
              </button>
              <button
                type="button"
                onClick={findCar}
                className="rounded bg-ember px-4 py-2 text-charcoal transition-colors hover:bg-rust hover:text-white"
              >
                Find my car
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

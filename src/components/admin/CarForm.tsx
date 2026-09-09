"use client";

import { useActionState } from "react";
import {
  CarCategory,
  Transmission,
  FuelType,
} from "@/generated/prisma/enums";
import type { CarFormState } from "@/lib/actions/admin";
import { inputClassName } from "@/lib/formStyles";
import { Select } from "@/components/Select";

const initialState: CarFormState = { status: "idle" };

export function CarForm({
  action,
  car,
}: {
  action: (
    prevState: CarFormState,
    formData: FormData
  ) => Promise<CarFormState>;
  car?: {
    id: string;
    make: string;
    model: string;
    year: number;
    category: CarCategory;
    transmission: Transmission;
    fuelType: FuelType;
    seats: number;
    pricePerDay: string;
    imageUrl: string;
    location: string;
    description: string | null;
    history: string | null;
  };
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-3">
      {car && <input type="hidden" name="id" value={car.id} />}

      {state.status === "error" && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Make
          <input
            name="make"
            defaultValue={car?.make}
            required
            className={inputClassName}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Model
          <input
            name="model"
            defaultValue={car?.model}
            required
            className={inputClassName}
          />
        </label>
        <label className="flex w-24 flex-col gap-1 text-sm">
          Year
          <input
            type="number"
            name="year"
            defaultValue={car?.year}
            required
            className={inputClassName}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Category
          <Select
            name="category"
            defaultValue={car?.category ?? ""}
            required
          >
            <option value="" disabled>
              Select
            </option>
            {Object.values(CarCategory).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Transmission
          <Select
            name="transmission"
            defaultValue={car?.transmission ?? ""}
            required
          >
            <option value="" disabled>
              Select
            </option>
            {Object.values(Transmission).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Fuel type
          <Select
            name="fuelType"
            defaultValue={car?.fuelType ?? ""}
            required
          >
            <option value="" disabled>
              Select
            </option>
            {Object.values(FuelType).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Seats
          <input
            type="number"
            name="seats"
            min={1}
            defaultValue={car?.seats}
            required
            className={inputClassName}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Price per day
          <input
            type="number"
            step="0.01"
            min={0}
            name="pricePerDay"
            defaultValue={car?.pricePerDay}
            required
            className={inputClassName}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Location
          <input
            name="location"
            defaultValue={car?.location}
            required
            className={inputClassName}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        {car ? "Replace image (optional)" : "Image"}
        {car && (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview only, not a public-facing card
          <img
            src={car.imageUrl}
            alt=""
            className="h-24 w-36 rounded object-cover"
          />
        )}
        {/* file: variant restyles just the native "Choose file" button
            (the part that read as raw OS chrome sitting inside an
            otherwise custom-styled form) to match every other button on
            the site — the "No file chosen" text next to it stays native
            since browsers don't expose a way to restyle that part. */}
        <input
          type="file"
          name="image"
          accept="image/*"
          required={!car}
          className={`file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-ember file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-charcoal file:transition-colors hover:file:bg-rust hover:file:text-white ${inputClassName}`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Description (shown as the short blurb on the listing)
        <textarea
          name="description"
          defaultValue={car?.description ?? ""}
          rows={2}
          className={inputClassName}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        History (shown on the detail page, under &quot;About the [make]
        [model]&quot;)
        <textarea
          name="history"
          defaultValue={car?.history ?? ""}
          rows={3}
          className={inputClassName}
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded bg-ember px-4 py-2 text-charcoal transition-colors hover:bg-rust hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-ember disabled:hover:text-charcoal"
      >
        {isPending ? "Saving…" : car ? "Save changes" : "Create car"}
      </button>
    </form>
  );
}

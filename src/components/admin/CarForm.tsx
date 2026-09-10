"use client";

import { useActionState } from "react";
import Link from "next/link";
import { UploadSimple } from "@phosphor-icons/react";
import {
  CarCategory,
  Transmission,
  FuelType,
} from "@/generated/prisma/enums";
import type { CarFormState } from "@/lib/actions/admin";
import { inputClassName } from "@/lib/formStyles";
import { Select } from "@/components/Select";

const initialState: CarFormState = { status: "idle" };

// Small uppercase section labels group the form into scannable chunks
// (vehicle details / photo / listing copy) instead of one long column
// of unrelated fields — same treatment as the section headers used
// elsewhere in the admin area.
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </h2>
  );
}

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
    <form
      action={formAction}
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-xl border border-mist bg-white p-6 shadow-sm sm:p-8"
    >
      {car && <input type="hidden" name="id" value={car.id} />}

      {state.status === "error" && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <SectionLabel>Vehicle details</SectionLabel>

        <div className="flex flex-wrap gap-4">
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
            Make
            <input
              name="make"
              defaultValue={car?.make}
              required
              className={inputClassName}
            />
          </label>
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
            Model
            <input
              name="model"
              defaultValue={car?.model}
              required
              className={inputClassName}
            />
          </label>
          <label className="flex w-24 flex-col gap-1.5 text-sm font-medium">
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

        <div className="flex flex-wrap gap-4">
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
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
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
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
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
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

        <div className="flex flex-wrap gap-4">
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
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
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
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
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
            Location
            <input
              name="location"
              defaultValue={car?.location}
              required
              className={inputClassName}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-mist pt-6">
        <SectionLabel>Photo</SectionLabel>

        <div className="flex flex-wrap items-center gap-4">
          {car && (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview only, not a public-facing card
            <img
              src={car.imageUrl}
              alt=""
              className="h-24 w-36 shrink-0 rounded-lg border border-mist object-cover"
            />
          )}

          {/* file: variant restyles just the native "Choose file" button
              (the part that read as raw OS chrome sitting inside an
              otherwise custom-styled form) to match every other button on
              the site — the "No file chosen" text next to it stays native
              since browsers don't expose a way to restyle that part. */}
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
            {car ? "Replace image (optional)" : "Image"}
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-mist p-3">
              <UploadSimple
                size={18}
                aria-hidden="true"
                className="shrink-0 text-gray-400"
              />
              <input
                type="file"
                name="image"
                accept="image/*"
                required={!car}
                className={`w-full border-none p-0 text-sm file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-ember file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-charcoal file:transition-colors hover:file:bg-rust hover:file:text-white`}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-mist pt-6">
        <SectionLabel>Listing copy</SectionLabel>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Description (shown as the short blurb on the listing)
          <textarea
            name="description"
            defaultValue={car?.description ?? ""}
            rows={2}
            className={inputClassName}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          History (shown on the detail page, under &quot;About the [make]
          [model]&quot;)
          <textarea
            name="history"
            defaultValue={car?.history ?? ""}
            rows={3}
            className={inputClassName}
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-mist pt-6">
        <Link
          href="/admin/cars"
          className="rounded border border-mist px-4 py-2 text-sm font-medium transition-colors hover:border-rust hover:bg-rust hover:text-white"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-ember px-5 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-rust hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-ember disabled:hover:text-charcoal"
        >
          {isPending ? "Saving…" : car ? "Save changes" : "Create car"}
        </button>
      </div>
    </form>
  );
}

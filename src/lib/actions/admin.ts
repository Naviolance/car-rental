"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadCarImage } from "@/lib/supabaseStorage";
import {
  CarCategory,
  Transmission,
  FuelType,
} from "@/generated/prisma/enums";

// Every admin action re-checks this itself — the layout gate keeps a
// non-admin from ever seeing the page, but a Server Action is still a
// real, directly-callable network endpoint. The UI hiding a button is
// not the same thing as the server refusing the request.
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

function parseEnum<T extends string>(
  value: FormDataEntryValue | null,
  allowed: readonly T[]
): T | null {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : null;
}

type CarFields = {
  make: string;
  model: string;
  year: number;
  category: CarCategory;
  transmission: Transmission;
  fuelType: FuelType;
  seats: number;
  pricePerDay: string;
  location: string;
  description: string | null;
  history: string | null;
};

// Shared between createCar and updateCar so the two forms can't quietly
// drift into accepting different things. Deliberately excludes the image
// — that's handled separately since it needs an async upload rather than
// simple field validation.
// Trims, then treats an all-whitespace value the same as absent — " "
// passing the `typeof === "string"` check but saving as blank is exactly
// the kind of thing that produces a row that looks fine in the database
// browser and broken on the actual page.
function trimmedOrNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function parseCarFields(formData: FormData): CarFields | null {
  const make = trimmedOrNull(formData.get("make"));
  const model = trimmedOrNull(formData.get("model"));
  const year = Number(formData.get("year"));
  const category = parseEnum(formData.get("category"), Object.values(CarCategory));
  const transmission = parseEnum(
    formData.get("transmission"),
    Object.values(Transmission)
  );
  const fuelType = parseEnum(formData.get("fuelType"), Object.values(FuelType));
  const seats = Number(formData.get("seats"));
  const pricePerDay = formData.get("pricePerDay");
  const location = trimmedOrNull(formData.get("location"));
  const description = trimmedOrNull(formData.get("description"));
  const history = trimmedOrNull(formData.get("history"));

  if (
    !make ||
    !model ||
    !Number.isInteger(year) ||
    year < 1900 ||
    !category ||
    !transmission ||
    !fuelType ||
    !Number.isInteger(seats) ||
    seats < 1 ||
    typeof pricePerDay !== "string" ||
    !pricePerDay ||
    Number.isNaN(Number(pricePerDay)) ||
    !location
  ) {
    return null;
  }

  return {
    make,
    model,
    year,
    category,
    transmission,
    fuelType,
    seats,
    pricePerDay,
    location,
    description,
    history,
  };
}

export type CarFormState = { status: "idle" } | { status: "error"; message: string };

export async function createCar(
  _prevState: CarFormState,
  formData: FormData
): Promise<CarFormState> {
  await requireAdmin();

  const fields = parseCarFields(formData);
  if (!fields) {
    return { status: "error", message: "Please fill in all required fields correctly." };
  }

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return { status: "error", message: "Please choose an image." };
  }

  let imageUrl: string;
  try {
    imageUrl = await uploadCarImage(image);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Image upload failed.",
    };
  }

  await prisma.car.create({ data: { ...fields, imageUrl } });
  redirect("/admin/cars");
}

export async function updateCar(
  _prevState: CarFormState,
  formData: FormData
): Promise<CarFormState> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { status: "error", message: "Missing car id." };
  }

  const fields = parseCarFields(formData);
  if (!fields) {
    return { status: "error", message: "Please fill in all required fields correctly." };
  }

  // The image field is optional on edit — an empty file input means
  // "keep the current image," not "clear it."
  const image = formData.get("image");
  let imageUrl: string | undefined;
  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await uploadCarImage(image);
    } catch (error) {
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Image upload failed.",
      };
    }
  }

  await prisma.car.update({
    where: { id },
    data: { ...fields, ...(imageUrl && { imageUrl }) },
  });
  redirect("/admin/cars");
}

export async function toggleCarActive(formData: FormData) {
  await requireAdmin();

  const carId = formData.get("carId");
  const nextActive = formData.get("nextActive") === "true";
  if (typeof carId !== "string" || !carId) return;

  await prisma.car.update({ where: { id: carId }, data: { isActive: nextActive } });
  redirect("/admin/cars");
}

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();

  const bookingId = formData.get("bookingId");
  const status = formData.get("status");
  if (
    typeof bookingId !== "string" ||
    !bookingId ||
    (status !== "CONFIRMED" &&
      status !== "CANCELLED" &&
      status !== "COMPLETED")
  ) {
    return;
  }

  await prisma.booking.update({ where: { id: bookingId }, data: { status } });
  redirect("/admin/bookings");
}

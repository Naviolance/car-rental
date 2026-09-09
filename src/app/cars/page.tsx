import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { CarCard } from "@/components/CarCard";
import { CarFilters } from "@/components/CarFilters";
import { EmptyState } from "@/components/EmptyState";
import {
  CarCategory,
  Transmission,
  FuelType,
  BookingStatus,
} from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { parseDateRange, dateRangeQueryString } from "@/lib/dateRangeParams";
import { parsePage, totalPagesFor, PAGE_SIZE } from "@/lib/pagination";
import { Pagination } from "@/components/Pagination";
import { getReviewStats } from "@/lib/reviewStats";

type SearchParams = {
  category?: string;
  transmission?: string;
  fuelType?: string;
  maxPrice?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
};

// Query-string values are attacker-controlled input, same as any other
// user input — validate against the real enum values rather than casting
// straight into a Prisma where clause.
function parseEnumParam<T extends string>(
  value: string | undefined,
  allowed: readonly T[]
): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const category = parseEnumParam(params.category, Object.values(CarCategory));
  const transmission = parseEnumParam(
    params.transmission,
    Object.values(Transmission)
  );
  const fuelType = parseEnumParam(params.fuelType, Object.values(FuelType));
  const maxPrice = Number(params.maxPrice);
  // Kept as one object rather than destructured — checking `.isValid`
  // narrows `.startDate`/`.endDate` from `Date | undefined` to `Date`
  // wherever they're accessed through this same reference, which
  // destructuring them out immediately would throw away.
  const dateRange = parseDateRange(params.startDate, params.endDate);
  const dateQueryString = dateRange.isValid
    ? dateRangeQueryString(dateRange.startDate, dateRange.endDate)
    : "";

  const where: Prisma.CarWhereInput = {
    isActive: true,
    category,
    transmission,
    fuelType,
    pricePerDay:
      Number.isFinite(maxPrice) && maxPrice > 0
        ? { lte: maxPrice }
        : undefined,
    // Two date ranges overlap when one starts before the other ends, in
    // both directions — so "no conflicting booking" means none of the
    // car's PENDING/CONFIRMED bookings satisfy that overlap test against
    // the requested range. CANCELLED bookings never block availability;
    // COMPLETED ones are already in the past by definition.
    ...(dateRange.isValid && {
      bookings: {
        none: {
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          startDate: { lt: dateRange.endDate },
          endDate: { gt: dateRange.startDate },
        },
      },
    }),
  };

  const page = parsePage(params.page);
  const [cars, totalCount] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy: { pricePerDay: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.car.count({ where }),
  ]);
  const totalPages = totalPagesFor(totalCount);
  const reviewStats = await getReviewStats(cars.map((car) => car.id));

  return (
    <div className="flex flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">All cars</h1>
        {dateRange.isValid && (
          <p className="text-sm text-gray-500">
            Showing cars available from{" "}
            {dateRange.startDate.toLocaleDateString()} to{" "}
            {dateRange.endDate.toLocaleDateString()}
          </p>
        )}
      </div>

      <CarFilters />

      {cars.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlass size={24} weight="light" aria-hidden="true" />}
        >
          No cars match those filters.
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={{ ...car, pricePerDay: Number(car.pricePerDay) }}
                queryString={dateQueryString}
                avgRating={reviewStats.get(car.id)?.avg}
                reviewCount={reviewStats.get(car.id)?.count}
              />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/cars"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}

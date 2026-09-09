import Link from "next/link";
import { PencilSimple, Archive, ArrowCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { toggleCarActive } from "@/lib/actions/admin";
import { parsePage, totalPagesFor, PAGE_SIZE } from "@/lib/pagination";
import { Pagination } from "@/components/Pagination";

const actionButtonClassName =
  "flex items-center gap-1.5 rounded border border-mist px-2.5 py-1 outline-none transition-colors hover:border-rust hover:bg-rust hover:text-white focus-visible:border-rust focus-visible:ring-2 focus-visible:ring-rust/20";

export default async function AdminCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);

  const [cars, totalCount] = await Promise.all([
    prisma.car.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.car.count(),
  ]);
  const totalPages = totalPagesFor(totalCount);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Fleet</h1>
        <Link
          href="/admin/cars/new"
          className="rounded bg-ember px-3 py-1.5 text-sm text-charcoal transition-colors hover:bg-rust hover:text-white"
        >
          New car
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {cars.map((car) => (
          <div
            key={car.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded border border-mist p-3"
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin list thumbnail, same external seed images as the public CarCard */}
              <img
                src={car.imageUrl}
                alt=""
                className="h-12 w-16 rounded object-cover"
              />
              <div>
                <p className="font-medium">
                  {car.make} {car.model} ({car.year})
                  {!car.isActive && (
                    <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                      Archived
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  ${Number(car.pricePerDay).toFixed(2)}/day · {car.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={`/admin/cars/${car.id}/edit`}
                className={actionButtonClassName}
              >
                <PencilSimple size={14} aria-hidden="true" />
                Edit
              </Link>
              <form action={toggleCarActive}>
                <input type="hidden" name="carId" value={car.id} />
                <input
                  type="hidden"
                  name="nextActive"
                  value={(!car.isActive).toString()}
                />
                <button type="submit" className={actionButtonClassName}>
                  {car.isActive ? (
                    <>
                      <Archive size={14} aria-hidden="true" />
                      Archive
                    </>
                  ) : (
                    <>
                      <ArrowCounterClockwise size={14} aria-hidden="true" />
                      Restore
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/cars"
        searchParams={params}
      />
    </div>
  );
}

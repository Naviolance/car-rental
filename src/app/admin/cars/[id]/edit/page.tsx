import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CarForm } from "@/components/admin/CarForm";
import { updateCar } from "@/lib/actions/admin";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await prisma.car.findUnique({ where: { id } });

  if (!car) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">
        Edit {car.make} {car.model}
      </h1>
      <CarForm
        action={updateCar}
        car={{ ...car, pricePerDay: car.pricePerDay.toString() }}
      />
    </div>
  );
}

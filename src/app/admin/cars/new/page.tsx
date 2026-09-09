import { CarForm } from "@/components/admin/CarForm";
import { createCar } from "@/lib/actions/admin";

export default function NewCarPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">New car</h1>
      <CarForm action={createCar} />
    </div>
  );
}

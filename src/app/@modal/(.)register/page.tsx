"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { RegisterForm } from "@/components/RegisterForm";

// Same pattern as @modal/(.)login: intercepts a soft navigation to
// /register and overlays it on the current page instead of replacing
// it. router.back() removes the pushed history entry, revealing that
// page again on close.
export default function InterceptedRegisterModal() {
  const router = useRouter();
  const back = () => router.back();

  return (
    <Modal title="Create an account" onClose={back}>
      <RegisterForm onSuccess={back} />
    </Modal>
  );
}

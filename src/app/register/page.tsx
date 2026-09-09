import { Modal } from "@/components/Modal";
import { RegisterForm } from "@/components/RegisterForm";

// The fallback: a direct visit (typed URL, bookmark, hard refresh) with
// no underlying page to reveal, so it renders as a full page and closes
// by going home. A soft navigation from inside the app (clicking
// "Register") never reaches this file — the intercepting route at
// app/@modal/(.)register/page.tsx overlays this same content instead.
export default function RegisterPage() {
  return (
    <Modal>
      <RegisterForm />
    </Modal>
  );
}

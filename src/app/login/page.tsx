import { Modal } from "@/components/Modal";
import { LoginForm } from "@/components/LoginForm";

// This is the fallback: a direct visit (typed URL, bookmark, hard
// refresh) with no underlying page to reveal, so it renders as a full
// page and closes by going home. A soft navigation from inside the app
// (clicking "Sign in") never actually reaches this file — the
// intercepting route at app/@modal/(.)login/page.tsx takes over instead
// and overlays this same content on top of whatever page you were on.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Modal>
      <LoginForm error={error} />
    </Modal>
  );
}

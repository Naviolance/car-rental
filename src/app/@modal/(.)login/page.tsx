"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Modal } from "@/components/Modal";
import { LoginForm } from "@/components/LoginForm";

// (.) intercepts /login when navigated to from another page inside the
// app (a <Link> or router.push, e.g. clicking "Sign in" in the Nav) —
// the URL still becomes /login, but this renders instead of the real
// route, overlaid on top of whatever page triggered the navigation
// instead of replacing it. router.back() is what makes closing reveal
// that exact page rather than redirecting anywhere: it just removes the
// history entry this navigation pushed. A hard refresh or direct visit
// to /login never reaches this file at all — Next.js only intercepts
// soft navigations, so that case falls through to the real route.
export default function InterceptedLoginModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? undefined;
  const back = () => router.back();

  return (
    <Modal onClose={back}>
      <LoginForm error={error} onSuccess={back} />
    </Modal>
  );
}

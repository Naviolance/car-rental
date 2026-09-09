"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogo } from "@phosphor-icons/react";
import {
  loginWithCredentials,
  loginWithGoogle,
  type LoginState,
} from "@/lib/actions/auth";
import { PasswordField } from "@/components/PasswordField";
import { SubmitButton } from "@/components/SubmitButton";
import { inputClassName } from "@/lib/formStyles";

const initialState: LoginState = { status: "idle" };

// The actual sign-in content, shared between the real /login route (a
// direct visit, no page to reveal on close) and its intercepted overlay
// (a soft navigation from elsewhere in the app) — same markup either
// way, so the two can't drift apart. `onSuccess` is how each route
// decides what "close" means for its own situation: the fallback route
// defaults to going home, the intercepted overlay passes router.back().
export function LoginForm({
  error,
  onSuccess,
}: {
  error?: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    loginWithCredentials,
    initialState
  );
  // Controlled so a failed attempt doesn't wipe what was typed — React
  // resets uncontrolled fields after a form action returns without
  // redirecting, which is exactly what happens on an "error" result here.
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (state.status !== "success") return;
    // The session cookie is already set (signIn ran server-side) — this
    // just needs the rest of the UI to catch up: leave/close this route
    // the way the caller wants, *then* refresh. refresh() targets
    // whatever route is current when it runs — the intercepted overlay
    // (onSuccess = router.back()) never actually leaves "/", so
    // refreshing before navigating happened to still work there, but
    // the fallback route (a direct /login visit) then navigates away
    // via router.push("/"), whose cached RSC payload predates the
    // session and refresh() ran too early to invalidate it — leaving
    // the nav showing signed-out until a manual reload.
    if (onSuccess) onSuccess();
    else router.push("/");
    router.refresh();
  }, [state, onSuccess, router]);

  const errorMessage =
    state.status === "error"
      ? state.message
      : error === "invalid"
        ? "Invalid email or password."
        : null;

  return (
    <>
      <h1 className="text-2xl font-semibold">Sign in</h1>

      {errorMessage && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
          />
        </label>
        <PasswordField name="password" />
        <Link href="/forgot-password" className="self-end text-sm text-gray-500 underline">
          Forgot password?
        </Link>
        <SubmitButton
          pendingText="Signing in…"
          className="rounded bg-ember px-3 py-2 text-charcoal transition-colors hover:bg-rust hover:text-white"
        >
          Sign in
        </SubmitButton>
      </form>

      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="h-px flex-1 bg-mist" />
        or
        <div className="h-px flex-1 bg-mist" />
      </div>

      <form action={loginWithGoogle}>
        <SubmitButton
          pendingText="Redirecting…"
          className="flex w-full items-center justify-center gap-2 rounded border border-mist px-3 py-2 hover:bg-gray-50"
        >
          <GoogleLogo size={18} weight="bold" />
          Sign in with Google
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-gray-500">
        No account?{" "}
        <Link href="/register" className="underline">
          Register
        </Link>
      </p>
    </>
  );
}

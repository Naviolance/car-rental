"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction, type RegisterState } from "@/lib/actions/auth";
import { PasswordField } from "@/components/PasswordField";
import { inputClassName } from "@/lib/formStyles";
import { isStrongPassword } from "@/lib/password";

const initialState: RegisterState = { status: "idle" };

// The actual registration content, shared between the real /register
// route (a direct visit) and its intercepted overlay — same reasoning
// as LoginForm/Modal: neither route wraps this in Modal itself, since
// each decides its own close behavior via `onSuccess`.
export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );
  // Controlled so the leaked-password warning (a normal, non-redirecting
  // return from the action) doesn't wipe what was already typed — React
  // resets uncontrolled fields whenever a form action returns without
  // redirecting. PasswordField already manages its own value the same
  // way, which is why it alone used to survive that round-trip.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordValid = isStrongPassword(password);

  useEffect(() => {
    if (state.status !== "success") return;
    // refresh() has to come after navigating, not before: it refreshes
    // whatever route is current *when it runs*. The intercepted overlay
    // (onSuccess = router.back()) never actually leaves "/", so calling
    // refresh() first happened to work there — but the fallback route
    // (a direct /register visit, onSuccess undefined) then navigates
    // away via router.push("/"), and "/" already has a stale cached
    // RSC payload from before the session existed. Refreshing before
    // that push refreshed the wrong (about-to-be-abandoned) route,
    // leaving the nav showing signed-out until a manual reload.
    if (onSuccess) onSuccess();
    else router.push("/");
    router.refresh();
  }, [state, onSuccess, router]);

  return (
    <>
      <h1 className="text-2xl font-semibold">Create an account</h1>

      {state.status === "error" && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      {state.status === "leaked" && (
        <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          This password has appeared in {state.count.toLocaleString()} known
          data breaches. We&apos;d recommend a different one — but it&apos;s
          your call.
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClassName}
          />
        </label>
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
        <PasswordField
          name="password"
          showStrengthMeter
          showGenerator
          onValueChange={setPassword}
        />

        {/* Only present once the warning has actually been shown — this
            is what lets registerAction skip the leak check on resubmit
            without ever being skippable on the first attempt. */}
        {state.status === "leaked" && (
          <input type="hidden" name="confirmLeaked" value="true" />
        )}

        {/* Disabled until the checklist above is actually all green —
            previously the only thing stopping an early click was the
            browser's own native minLength popup, which (a) looked like
            it belonged to a completely different, older site and (b)
            only checked length, not the other four rules the checklist
            already tracks. This makes the button agree with the
            checklist instead of the two giving conflicting signals. */}
        <button
          type="submit"
          disabled={isPending || !passwordValid}
          className="rounded bg-ember px-3 py-2 text-charcoal transition-colors hover:bg-rust hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-ember disabled:hover:text-charcoal"
        >
          {isPending
            ? "Creating…"
            : state.status === "leaked"
              ? "Create anyway"
              : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

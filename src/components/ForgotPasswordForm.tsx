"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  type RequestResetState,
} from "@/lib/actions/passwordReset";
import { SubmitButton } from "@/components/SubmitButton";
import { inputClassName } from "@/lib/formStyles";

const initialState: RequestResetState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    requestPasswordReset,
    initialState
  );
  const [email, setEmail] = useState("");

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="text-sm text-gray-500">
          Enter your account email and we&apos;ll get you a reset link.
        </p>
      </div>

      {state.status === "error" && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      {state.status === "success" ? (
        // No real email provider is wired up for this portfolio project
        // (see /about) — this is the honest stand-in: the same reset
        // link a real deployment would email you, shown here instead.
        <div className="flex flex-col gap-2 rounded border border-mist p-4 text-sm">
          <p className="text-gray-700">
            In a real deployment this would be emailed to you. Here it is
            directly:
          </p>
          <Link href={state.resetUrl} className="break-all text-rust underline">
            {state.resetUrl}
          </Link>
        </div>
      ) : (
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
          <SubmitButton
            pendingText="Sending…"
            className="rounded bg-ember px-3 py-2 text-charcoal transition-colors hover:bg-rust hover:text-white"
          >
            Send reset link
          </SubmitButton>
        </form>
      )}

      <p className="text-center text-sm text-gray-500">
        <Link href="/login" className="underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

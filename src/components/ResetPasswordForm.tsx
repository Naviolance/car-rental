"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  resetPassword,
  type ResetPasswordState,
} from "@/lib/actions/passwordReset";
import { PasswordField } from "@/components/PasswordField";
import { isStrongPassword } from "@/lib/password";

const initialState: ResetPasswordState = { status: "idle" };

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    resetPassword,
    initialState
  );
  const [password, setPassword] = useState("");
  const passwordValid = isStrongPassword(password);

  useEffect(() => {
    if (state.status !== "success") return;
    router.push("/login");
  }, [state, router]);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Choose a new password</h1>

      {state.status === "error" && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="token" value={token} />
        <PasswordField
          name="password"
          label="New password"
          showStrengthMeter
          showGenerator
          onValueChange={setPassword}
        />
        <button
          type="submit"
          disabled={isPending || !passwordValid}
          className="rounded bg-ember px-3 py-2 text-charcoal transition-colors hover:bg-rust hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-ember disabled:hover:text-charcoal"
        >
          {isPending ? "Saving…" : "Set new password"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        <Link href="/login" className="underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

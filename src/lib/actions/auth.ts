"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStrongPassword } from "@/lib/password";
import { checkPasswordLeaked } from "@/lib/leakedPassword";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

const initialLoginState: LoginState = { status: "idle" };

export async function loginWithCredentials(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    // redirect: false — signIn still sets the session cookie on success,
    // but returns instead of throwing Next's internal redirect signal.
    // Letting it redirect itself is what broke the intercepted /login
    // overlay: navigating to "/" via that redirect doesn't reliably clear
    // the @modal slot when "/" is the same page already rendered
    // underneath, leaving the overlay open with a freshly remounted
    // (blank) form instead of closing. Closing is the client's job now —
    // see LoginForm's onSuccess effect, which reacts to `status: "success"`.
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    // A bad email/password throws an AuthError from inside signIn
    // regardless of the redirect option above — that part of its behavior
    // doesn't change. Anything else (a real crash) should still surface
    // as a real error rather than being swallowed into "invalid".
    if (error instanceof AuthError) {
      return { status: "error", message: "Invalid email or password." };
    }
    throw error;
  }
  return { status: "success" };
}

export async function loginWithGoogle() {
  // Google's OAuth flow leaves the app entirely (redirect to Google, then
  // back via a callback URL) — that's a real navigation no matter what,
  // so a server redirect is correct and unavoidable here, unlike the
  // credentials case above.
  await signIn("google", { redirectTo: "/" });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export type RegisterState =
  | { status: "idle" }
  | { status: "error"; message: string }
  // Not a hard block — a breach hit just means "this exact password is
  // in a known leaked-credentials list," not that this account is
  // compromised. The user gets to decide whether that risk is acceptable.
  | { status: "leaked"; count: number }
  | { status: "success" };

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmLeaked = formData.get("confirmLeaked") === "true";

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name ||
    !email
  ) {
    return { status: "error", message: "Please fill in all fields." };
  }

  // The checklist on the page is just UX — this is the real gate. Someone
  // could submit straight to this action and skip the browser entirely, so
  // "the button turned green" can never be the only thing enforcing this.
  if (!isStrongPassword(password)) {
    return {
      status: "error",
      message: "That password doesn't meet the requirements below.",
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      status: "error",
      message: "An account with that email already exists.",
    };
  }

  // Skipped once the user has already seen the warning and resubmitted —
  // otherwise they could never get past it even if they accept the risk.
  if (!confirmLeaked) {
    const leakCount = await checkPasswordLeaked(password);
    if (leakCount > 0) {
      return { status: "leaked", count: leakCount };
    }
  }

  // Cost factor 10: bcrypt's standard default, balancing hashing time
  // against brute-force resistance.
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, password: hashedPassword } });

  // Signs the new account straight in rather than sending them back to
  // /login to type the same credentials again.
  return loginWithCredentials(initialLoginState, formData);
}

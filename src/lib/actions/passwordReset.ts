"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isStrongPassword } from "@/lib/password";

// Reuses Auth.js's own VerificationToken table (identifier/token/expires)
// rather than adding a dedicated model — it already exists in the schema
// for exactly this "prove you control this email address" purpose, and a
// password reset is just that.
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export type RequestResetState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; resetUrl: string };

export async function requestPasswordReset(
  _prevState: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email) {
    return { status: "error", message: "Enter your email address." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // A real, email-delivered flow always shows the same "check your inbox"
  // message here regardless of whether the account exists — otherwise
  // the response itself tells an attacker which emails are registered.
  // That protection is specifically what displaying the link directly
  // (rather than emailing it) gives up in exchange for not needing a
  // real email provider — since either a real link appears here or it
  // doesn't, being direct about "no account with that email" is more
  // honest than pretending a distinction that isn't actually enforced.
  if (!user) {
    return {
      status: "error",
      message: "No account found with that email address.",
    };
  }

  // One live request per account — clears anything left over from an
  // earlier, abandoned attempt rather than letting unused tokens pile up.
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  return {
    status: "success",
    resetUrl: `${protocol}://${host}/reset-password?token=${token}`,
  };
}

export type ResetPasswordState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get("token");
  const password = formData.get("password");

  if (typeof token !== "string" || !token) {
    return { status: "error", message: "This reset link is invalid." };
  }
  if (typeof password !== "string") {
    return { status: "error", message: "Enter a new password." };
  }
  // Same reasoning as registerAction: the strength checklist on the page
  // is UX, this is the real gate — a direct POST to this action can skip
  // the browser entirely.
  if (!isStrongPassword(password)) {
    return {
      status: "error",
      message: "That password doesn't meet the requirements below.",
    };
  }

  const record = await prisma.verificationToken.findFirst({ where: { token } });

  if (!record || record.expires < new Date()) {
    // An expired token is still a used-up one — delete it so a stale
    // link can't be retried once it's past its window.
    if (record) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: { identifier: record.identifier, token: record.token },
        },
      });
    }
    return {
      status: "error",
      message: "This reset link is invalid or has expired. Request a new one.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email: record.identifier },
    data: { password: hashedPassword },
  });

  // Single-use: delete immediately on success so the same link can't
  // reset the password a second time.
  await prisma.verificationToken.delete({
    where: {
      identifier_token: { identifier: record.identifier, token: record.token },
    },
  });

  return { status: "success" };
}

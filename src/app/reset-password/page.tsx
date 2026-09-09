import Link from "next/link";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // No token in the URL at all (typed the path directly, or followed a
  // stripped link) is a different case from a token that exists but has
  // expired — that one's still handled by the form itself, since only
  // the server action can check it against the database.
  if (!token) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-3 px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Invalid reset link</h1>
        <p className="text-sm text-gray-500">
          This link is missing its reset token.{" "}
          <Link href="/forgot-password" className="underline">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

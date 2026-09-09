import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

// A real standalone page, not a Modal like /login and /register — there's
// no natural "page underneath" to reveal on close for a link someone
// followed from their email (or, here, from the on-screen stand-in), so
// the intercepting-overlay pattern those two use doesn't fit this flow.
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

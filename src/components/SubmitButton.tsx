"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";

// useFormStatus only works inside a <form>, reading whichever one this
// button renders in — it needs client-side state, but the form itself
// (and the page around it) doesn't. This is what gives a Server
// Component page a pending state on submit without converting the whole
// page to a Client Component just for a loading indicator.
export function SubmitButton({
  children,
  pendingText,
  className,
  ...props
}: ComponentProps<"button"> & { pendingText: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? pendingText : children}
    </button>
  );
}

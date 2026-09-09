"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "@phosphor-icons/react";

// Same backdrop pattern as CarFinderWizard (bg-black/40 backdrop-blur-sm,
// click-outside and Escape both close, clicking the card itself doesn't).
// `onClose` is the caller's decision, not this component's: a route
// reachable by a direct visit (no underlying page to reveal) closes by
// going home, while an intercepted overlay closes with router.back() to
// reveal whatever page it was opened over. Shared by /login and
// /register — both are "a real route that can also render as an
// overlay," not two different UI patterns.
export function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const router = useRouter();
  const close = onClose ?? (() => router.push("/"));

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally subscribes once: `close` calls either router.push or router.back, both stable across the component's lifetime regardless of which render defined the closure.
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative mx-4 flex w-full max-w-sm flex-col gap-6 rounded-xl border border-mist bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
        >
          <X size={18} weight="bold" />
        </button>
        {children}
      </div>
    </div>
  );
}

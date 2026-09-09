"use client";

import { useEffect, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "@phosphor-icons/react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Same backdrop pattern as CarFinderWizard (bg-black/40 backdrop-blur-sm,
// click-outside and Escape both close, clicking the card itself doesn't).
// `onClose` is the caller's decision, not this component's: a route
// reachable by a direct visit (no underlying page to reveal) closes by
// going home, while an intercepted overlay closes with router.back() to
// reveal whatever page it was opened over. Shared by /login and
// /register — both are "a real route that can also render as an
// overlay," not two different UI patterns.
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const router = useRouter();
  const close = onClose ?? (() => router.push("/"));
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally subscribes once: `close` calls either router.push or router.back, both stable across the component's lifetime regardless of which render defined the closure.
  }, []);

  // Focus management + a background hidden from assistive tech: without
  // this, a keyboard user opening "Sign in" keeps tabbing through the
  // still-mounted page behind the overlay (Nav links, hero form, footer)
  // instead of into the dialog, and a screen reader can still reach that
  // background content since nothing marks it inert. The parallel-route
  // `@modal` slot renders this as a sibling of <main> directly under
  // <body> (see layout.tsx), not as a replacement for it — hiding those
  // siblings here, rather than relying on the modal's own stacking, is
  // what actually removes them from the accessibility tree while this
  // is open. That also resolves the page having two <h1>s in the DOM at
  // once (the underlying page's and this dialog's): with the background
  // aria-hidden, only this dialog's heading remains in the a11y tree.
  useEffect(() => {
    const dialogEl = dialogRef.current;
    const rootEl = rootRef.current;
    if (!dialogEl || !rootEl) return;

    // Compared against rootEl (the fixed-position backdrop <div>, the
    // actual direct child of <body>), not dialogEl (the card nested
    // inside it) — filtering by dialogEl left the backdrop itself, and
    // so the whole modal including the dialog, in the "sibling" set and
    // hid it from assistive tech along with everything else.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const siblings = Array.from(document.body.children).filter(
      (el) => el !== rootEl
    );
    siblings.forEach((el) => el.setAttribute("aria-hidden", "true"));

    const focusable = dialogEl.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR
    );
    (focusable[0] ?? dialogEl).focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const items = Array.from(
        dialogEl!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleTab);

    return () => {
      siblings.forEach((el) => el.removeAttribute("aria-hidden"));
      document.removeEventListener("keydown", handleTab);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
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
        {/* Visually hidden — LoginForm/RegisterForm already render their
            own visible <h1>, this just gives aria-labelledby something
            with the same text to point at without a duplicate heading
            showing on screen. */}
        <span id={titleId} className="sr-only">
          {title}
        </span>
        {children}
      </div>
    </div>
  );
}

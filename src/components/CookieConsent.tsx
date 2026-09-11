"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ACKNOWLEDGED_KEY = "cookieNoticeAcknowledged";

// Starts hidden — matches what the server rendered (there's no
// localStorage during SSR) — and a mount effect below reveals it only if
// this browser hasn't dismissed it before. Same pattern as
// CarFinderWizard's isOpen, and for the same reason: computing this
// during the render that produces the initial HTML would either mismatch
// the client's hydration or need to assume "not yet dismissed" up front,
// showing the banner for a flash even to returning visitors.
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(ACKNOWLEDGED_KEY) !== "true") {
        setVisible(true);
      }
    } catch {
      // Storage can throw (private browsing, disabled site data) — fall
      // back to just not showing a banner that could never be
      // permanently dismissed anyway.
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(ACKNOWLEDGED_KEY, "true");
    } catch {
      // Same as above — a failed write just means this shows again next
      // visit, a minor inconvenience rather than a bug worth crashing over.
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-mist bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          This site only stores what it needs to work — a sign-in session
          and a small note remembering you&apos;ve seen the &quot;Find my
          car&quot; pop-up. No analytics, no ads, no tracking.{" "}
          <Link href="/privacy" className="underline hover:text-rust">
            Read more
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded bg-ember px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-rust hover:text-white"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

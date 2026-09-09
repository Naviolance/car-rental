"use client";

import { useEffect, useId, useState } from "react";
import { Eye, EyeSlash, CheckCircle, Circle } from "@phosphor-icons/react";
import { PASSWORD_RULES, generateStrongPassword } from "@/lib/password";
import { inputClassName } from "@/lib/formStyles";

// Interactive (typing, click-to-generate, live-updating checklist) means
// this has to be a Client Component — a Server Component can't hold state
// or respond to onChange/onClick. It's rendered from within a Server
// Component's <form action={...}>, which is fine: Server Components can
// render Client Components as children, just not the other way around.
export function PasswordField({
  name,
  label = "Password",
  showStrengthMeter = false,
  showGenerator = false,
  onValueChange,
}: {
  name: string;
  label?: string;
  showStrengthMeter?: boolean;
  showGenerator?: boolean;
  // Lets a parent (RegisterForm) see the current value without this
  // component giving up owning its own state — login doesn't need this
  // at all, which is exactly the asymmetry that used to be missing:
  // login and register used to share one hardcoded minLength={8}, which
  // is a *registration* rule (new password must meet these rules), not
  // a login one (whatever your real password is, right or wrong, is the
  // server's call to make — not a client-side length gate that could
  // block a legitimate sign-in attempt from ever being sent).
  onValueChange?: (value: string) => void;
}) {
  const id = useId();
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    onValueChange?.(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only `value` should retrigger this; `onValueChange` is expected to be a stable setState function, not something that should cause its own re-fire.
  }, [value]);

  function handleGenerate() {
    setValue(generateStrongPassword());
    setVisible(true);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`w-full pr-10 ${inputClassName}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-charcoal"
        >
          {visible ? <EyeSlash size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showGenerator && (
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            onClick={handleGenerate}
            className="text-rust underline"
          >
            Generate strong password
          </button>
          {value && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-gray-500 underline"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      )}

      {showStrengthMeter && (
        <ul className="flex flex-col gap-1 text-sm">
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(value);
            return (
              <li
                key={rule.label}
                className={`flex items-center gap-1.5 ${met ? "text-green-600" : "text-gray-400"}`}
              >
                {met ? (
                  <CheckCircle size={14} weight="fill" aria-hidden="true" />
                ) : (
                  <Circle size={14} aria-hidden="true" />
                )}
                {rule.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Shared between the client-side strength checklist (src/components/PasswordField.tsx)
// and the server-side check in registerAction — one set of rules, so the UI
// promise ("green means accepted") can never drift from what the server
// actually enforces.

export interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
  { label: "One special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export function isStrongPassword(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()-_=+";

function randomInt(maxExclusive: number): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % maxExclusive;
}

function randomChar(charset: string): string {
  return charset[randomInt(charset.length)];
}

export function generateStrongPassword(length = 16): string {
  const all = LOWER + UPPER + DIGITS + SPECIAL;
  // Guarantee one of each required category, then fill the rest randomly
  // from the full set so length stays configurable.
  const chars = [
    randomChar(UPPER),
    randomChar(LOWER),
    randomChar(DIGITS),
    randomChar(SPECIAL),
    ...Array.from({ length: Math.max(length - 4, 0) }, () => randomChar(all)),
  ];

  // Fisher-Yates shuffle so the guaranteed characters aren't always up front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

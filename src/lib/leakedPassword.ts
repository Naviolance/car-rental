import "server-only";
import { createHash } from "node:crypto";

// Have I Been Pwned's "Pwned Passwords" API, k-anonymity model: we hash the
// password (SHA-1 — not for our own security, but because that's the hash
// this specific API indexes) and send only the first 5 hex characters.
// HIBP returns every known-breached hash sharing that prefix; we compare
// the remaining 35 characters locally. The full password, and even the
// full hash, never leave this server. `import "server-only"` at the top
// isn't decoration — it makes the build fail if this file is ever pulled
// into client-side code, since it should never run in the browser.
export async function checkPasswordLeaked(password: string): Promise<number> {
  const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  if (!response.ok) {
    // If HIBP is unreachable, don't block registration over a third-party
    // outage — fail open on the warning, not on account creation.
    return 0;
  }

  const body = await response.text();
  for (const line of body.split("\n")) {
    const [lineSuffix, count] = line.trim().split(":");
    if (lineSuffix === suffix) {
      return Number(count);
    }
  }

  return 0;
}

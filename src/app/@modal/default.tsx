// Required by parallel routes: when the current URL doesn't match
// anything inside this slot (i.e. almost every page, since only /login
// has an intercepted version here), Next.js needs to know to render
// nothing for this slot rather than erroring or reusing stale content.
export default function Default() {
  return null;
}

import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

// A Server Component — plain links, no client state needed. Preserves
// every other query param (filters, dates) when moving between pages, so
// paginating never silently drops whatever the user had narrowed down.
export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  const linkStyle =
    "flex items-center gap-1 rounded border border-mist px-3 py-1.5 outline-none transition-colors hover:border-ember focus-visible:border-rust focus-visible:ring-2 focus-visible:ring-rust/20";
  const disabledStyle =
    "flex items-center gap-1 rounded border border-mist px-3 py-1.5 text-gray-300";

  return (
    <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
      {currentPage > 1 ? (
        <Link href={hrefFor(currentPage - 1)} className={linkStyle}>
          <CaretLeft size={14} aria-hidden="true" /> Previous
        </Link>
      ) : (
        <span className={disabledStyle}>
          <CaretLeft size={14} aria-hidden="true" /> Previous
        </span>
      )}
      <span className="text-gray-500">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link href={hrefFor(currentPage + 1)} className={linkStyle}>
          Next <CaretRight size={14} aria-hidden="true" />
        </Link>
      ) : (
        <span className={disabledStyle}>
          Next <CaretRight size={14} aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}

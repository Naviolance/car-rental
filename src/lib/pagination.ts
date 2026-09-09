export const PAGE_SIZE = 9;

// Query-string input, same as everywhere else — validate rather than
// trust. An invalid or missing page falls back to page 1 rather than
// producing a negative skip/take or an empty, confusing result.
export function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function totalPagesFor(totalCount: number, pageSize: number = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

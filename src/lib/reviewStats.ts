import { prisma } from "@/lib/prisma";

export type ReviewStats = Map<string, { avg: number; count: number }>;

// Scoped to the specific cars being displayed (not every car in the
// database) — a page only needs stats for what it's actually rendering.
export async function getReviewStats(carIds: string[]): Promise<ReviewStats> {
  if (carIds.length === 0) return new Map();

  const grouped = await prisma.review.groupBy({
    by: ["carId"],
    where: { carId: { in: carIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const stats: ReviewStats = new Map();
  for (const row of grouped) {
    stats.set(row.carId, {
      avg: row._avg.rating ?? 0,
      count: row._count.rating,
    });
  }
  return stats;
}

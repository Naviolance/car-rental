import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Next.js dev mode hot-reloads modules on every file save, which would
// otherwise create a fresh PrismaClient (and a fresh connection pool) on
// every reload and eventually exhaust Postgres's connection limit. Caching
// the instance on `globalThis` survives reloads in dev; in production each
// serverless invocation gets a clean module scope anyway, so it's skipped.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

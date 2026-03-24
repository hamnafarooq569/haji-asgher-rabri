import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Prevent creating many Prisma instances in dev (hot reload)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
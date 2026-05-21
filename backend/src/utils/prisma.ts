import { PrismaClient } from '@prisma/client';

/**
 * Single shared Prisma client. In dev with ts-node-dev's reload we attach to
 * `globalThis` to avoid leaking connections on every reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

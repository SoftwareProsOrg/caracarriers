import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/lib/env";

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
};

// Reuse the client across hot-reloads in development
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

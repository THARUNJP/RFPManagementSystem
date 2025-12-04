import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { appEnv } from "./env";

const adapter = new PrismaPg({
  connectionString: appEnv.database.main!,
});

// Prevent multiple instances in dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      appEnv.env === "development"
        ? ["query", "info", "warn", "error"]
        : ["warn", "error"],
  });

if (appEnv.env !== "production") globalForPrisma.prisma = prisma;

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

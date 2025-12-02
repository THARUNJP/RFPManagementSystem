import { PrismaClient } from "@prisma/client";
import { appEnv } from "./env";
import { PrismaPg } from '@prisma/adapter-pg';


const adapter = new PrismaPg({
  connectionString: appEnv.database.main!,
});

export const prisma = new PrismaClient({
  adapter,
  log: appEnv.env === "development"
    ? ["query", "info", "warn", "error"]
    : ["warn", "error"],
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

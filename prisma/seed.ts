// prisma/seed.ts

import "dotenv/config"
import { SeedDatabase } from "./seeds/vendor.seed";

async function main() {
  await SeedDatabase();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // disconnect Prisma client if needed
  });

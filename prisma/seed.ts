// prisma/seed.ts

import "dotenv/config"
import { seedVendors } from "./seeds/vendor.seed";

async function main() {
  await seedVendors();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // disconnect Prisma client if needed
  });

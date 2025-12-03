// prisma/seeds/vendors.ts

import { prisma } from "../../src/config/prisma";

export async function seedVendors() {
  const vendors = [
    { name: "Vendor One", contact_email: "vendor1@example.com", phone: "1234567890" },
    { name: "Vendor Two", contact_email: "vendor2@example.com", phone: "0987654321" },
  ];

  await prisma.vendors.createMany({
    data: vendors,
    skipDuplicates: true,
  });

  console.log("Vendors seeded");
}

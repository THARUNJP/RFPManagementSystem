// prisma/seeds/vendors.ts

import { prisma } from "../../src/config/prisma";

export async function seedVendors() {
   const vendors = [
    
    { name: "Vendor Three", contact_email: "vendor3@example.com", phone: "1112223333" },
    { name: "Vendor Four", contact_email: "vendor4@example.com", phone: "2223334444" },
    { name: "Vendor Five", contact_email: "vendor5@example.com", phone: "3334445555" },
    { name: "Vendor Six", contact_email: "vendor6@example.com", phone: "4445556666" },
    { name: "Vendor Seven", contact_email: "vendor7@example.com", phone: "5556667777" },
    { name: "Vendor Eight", contact_email: "vendor8@example.com", phone: "6667778888" },
    { name: "Vendor Nine", contact_email: "vendor9@example.com", phone: "7778889999" },
  ];

  await prisma.vendors.createMany({
    data: vendors,
    skipDuplicates: true,
  });

  console.log("Vendors seeded");
}

import { prisma } from "../config/prisma";
import { CreateVendorInput } from "../validators/vendor.validator";

export async function create({
  name,
  contact_email,
  phone,
}: CreateVendorInput) {
  const vendor = await prisma.vendors.create({
    data: {
      name,
      contact_email,
      phone,
      is_active: true,
    },
  });

  return vendor;
}

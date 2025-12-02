import { prisma } from "../config/prisma";
import { CreateVendorInput, UpdateVendorInput } from "../validators/vendor.validator";

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

export async function list(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const vendors = await prisma.vendors.findMany({
    where: { is_active: true },
    skip,
    take: limit,
    orderBy: { created_at: "desc" },
  });

  return vendors;
}

export async function update(vendor_id: string, payload: UpdateVendorInput) {
  const vendor = await prisma.vendors.update({
    where: { vendor_id },
    data: payload,
  });

  return vendor;
}

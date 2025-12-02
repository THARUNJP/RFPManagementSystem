import z from "zod";

export const createVendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact_email: z.email("Invalid email format"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
});

export const updateVendorSchema = z.object({
  name: z.string().min(2).optional(),
  contact_email: z.email().optional(),
  phone: z.string().min(10).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

export const vendorIdSchema = z.object({
  vendor_id: z.ulid("Invalid vendor_id format"),
});

export const listVendorQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;

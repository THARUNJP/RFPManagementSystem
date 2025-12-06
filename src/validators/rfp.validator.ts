import { z } from "zod";

export const CreateRfpSchema = z
  .object({
    title: z.string().min(3).max(100),
    description_raw: z.string().min(10),
  })
  .strict();

export const getRfpParamsSchema = z.object({
  rfp_id: z.ulid(),
}).strict();

export const listRfpsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
}).strict();

export const sendRfpSchema = z.object({
  vendor_ids: z.array(z.ulid()).nonempty(),
}).strict();

export const sendRfpParamsSchema = z.object({
  rfp_id: z.ulid(),
}).strict();

export const GetRfpVendorsParamsSchema = z.object({
  rfp_id: z.ulid()
}).strict();

export const getProposalsParamsSchema = z.object({
  rfp_id: z.ulid(),
}).strict();

export const getVendorStatusParamsSchema = z.object({
  rfp_id: z.ulid(),
}).strict();

export const getAiRecommendationParamsSchema = z.object({
  rfp_id: z.ulid(),
}).strict();



export type CreateRfpInput = z.infer<typeof CreateRfpSchema>;
export type SendRfpInput = z.infer<typeof sendRfpParamsSchema> & z.infer<typeof sendRfpSchema>;

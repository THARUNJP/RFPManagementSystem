import { prisma } from "../config/prisma";
import { BATCH_SIZE } from "../lib/constant/constant";
import { NotFound, UnprocessableEntity } from "../lib/errors/httpError";
import { buildRfpPrompt, isEmptyResult } from "../lib/helper/helper";
import { Gemini } from "../llm/gemini.llm";
import { CreateRfpInput, SendRfpInput } from "../validators/rfp.validator";
import * as EmailService from "./email.service";

export const create = async ({ title, description_raw }: CreateRfpInput) => {
  const prompt = buildRfpPrompt(description_raw);
  const description_structured = await Gemini(prompt);

  if (isEmptyResult(description_structured)) {
    throw new UnprocessableEntity(
      "Structured RFP generation failed — AI returned empty result"
    );
  }

  const {
    budget = null,
    delivery_timeline = null,
    payment_terms = null,
    warranty = null,
  } = description_structured;

  const newRfp = await prisma.rfps.create({
    data: {
      title,
      description_raw,
      description_structured,
      budget,
      delivery_timeline,
      payment_terms,
      warranty,
      is_active: true,
    },
  });

  return newRfp;
};

export const getById = async (rfp_id: string) => {
  const rfp = await prisma.rfps.findUnique({
    where: { rfp_id },
  });

  if (!rfp) {
    throw new NotFound("RFP not found");
  }

  return rfp;
};

export const list = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const rfps = await prisma.rfps.findMany({
    skip,
    take: limit,
    orderBy: { created_at: "desc" },
    select: {
      rfp_id: true,
      title: true,
      budget: true,
      created_at: true,
      description_structured: true,
    },
  });

  return rfps;
};
// Needs to implement batching later for performance
export const send = async ({ rfp_id, vendor_ids }: SendRfpInput) => {
  for (let i = 0; i < vendor_ids.length; i += BATCH_SIZE) {
    const batch = vendor_ids.slice(i, i + BATCH_SIZE);

    // Process all vendors in the batch concurrently
    await Promise.all(
      batch.map(async (vendor_id) => {
        try {
          // Upsert the vendor record
          const record = await prisma.rfp_vendors.upsert({
            where: { rfp_id_vendor_id: { rfp_id, vendor_id } },
            create: { rfp_id, vendor_id, email_status: "pending" },
            update: {},
          });

          // Send email
          await EmailService.sendVendor(rfp_id, vendor_id,record.id);

          // Mark as sent
          await prisma.rfp_vendors.update({
            where: { id: record.id },
            data: { email_status: "sent", sent_at: new Date() },
          });
        } catch (err) {
          // Mark as failed
          await prisma.rfp_vendors.update({
            where: { rfp_id_vendor_id: { rfp_id, vendor_id } },
            data: { email_status: "failed" },
          });
        }
      })
    );
  }
};

export const checkById = async (rfp_id: string): Promise<void> => {
  const exists = await prisma.rfps.findUnique({
    where: { rfp_id },
    select: { rfp_id: true },
  });

  if (!exists) {
    throw new NotFound("RFP not found");
  }
};

export async function getVendors(rfp_id: string) {
  // Verify RFP exists & active
  const rfp = await prisma.rfps.findFirst({
    where: { rfp_id, is_active: true }
  });

  if (!rfp) {
    throw new NotFound("RFP not found");
  }

  // Query rfp_vendors with vendor name
  const records = await prisma.rfp_vendors.findMany({
    where: { rfp_id, is_active: true },
    select: {
      vendor_id: true,
      email_status: true,
      vendors: {
        select: {
          name: true,
          contact_email:true,
          
        }
      }
    }
  });

  return records.map(r => ({
    vendor_id: r.vendor_id,
    name: r.vendors.name,
    email_status: r.email_status
  }));
}


import { comparisons } from "@prisma/client";
import { prisma } from "../config/prisma";
import { BATCH_SIZE } from "../lib/constant/constant";
import { NotFound, UnprocessableEntity } from "../lib/errors/httpError";
import {
  buildBatchComparisonPrompt,
  buildFinalSelectionPrompt,
  buildRfpPrompt,
  chunkArray,
  flattenProposalResponse,
  isEmptyResult,
} from "../lib/helper/helper";
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

export const list = async (page = 1, limit = 10) => {
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

  const total = await prisma.rfps.count();

  return { data: rfps, total };
};

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
          await EmailService.sendVendor(rfp_id, vendor_id, record.id);

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
    where: { rfp_id, is_active: true },
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
          contact_email: true,
        },
      },
    },
  });

  return records.map((r) => ({
    vendor_id: r.vendor_id,
    name: r.vendors.name,
    email_status: r.email_status,
  }));
}

export async function getProposals(rfp_id: string) {
  const proposals = await prisma.proposals.findMany({
    where: { rfp_id },
    include: {
      vendors: {
        select: {
          name: true,
          contact_email: true,
          phone: true,
        },
      },
    },
  });

  // Use helper to flatten vendor info
  return flattenProposalResponse(proposals);
}
// add limit and offset if time exist
export async function getVendorStatus(rfp_id: string) {
  const records = await prisma.rfp_vendors.findMany({
    where: { rfp_id },
    include: {
      vendors: {
        select: {
          name: true,
          contact_email: true,
          phone: true,
        },
      },
    },
  });

  // Flatten the structure
  return records.map((rec) => ({
    ...rec,
    name: rec.vendors?.name || null,
    contact_email: rec.vendors?.contact_email || null,
    phone: rec.vendors?.phone || null,
    vendors: undefined, // remove nested object
  }));
}

export async function getAiRecommendation(rfp_id: string) {
  const comparison = await prisma.comparisons.findFirst({
    where: { rfp_id },
    orderBy: { generated_at: "desc" },
  });

  if (!comparison) {
    return await comparisonNotExist(rfp_id);
  }

  return await comparisonExist(rfp_id, comparison);
}

export async function comparisonNotExist(rfp_id: string) {
  const proposals = await prisma.proposals.findMany({
    where: { rfp_id },
  });

  const rfp = await prisma.rfps.findUnique({
    where: { rfp_id },
  });

  if (proposals.length === 0) {
    throw new NotFound("Proposals not found for RFP");
  }

  const batches = chunkArray(proposals, 10);

  const batchWinners: any[] = [];

  for (const batch of batches) {
    const prompt = buildBatchComparisonPrompt(rfp, batch);
    const ai = await Gemini(prompt); // Must return JSON

    if (!ai?.batch_best) continue;

    // Save all scores in this batch
    if (Array.isArray(ai.all_scores)) {
      for (const result of ai.all_scores) {
        await prisma.comparisons.create({
          data: {
            rfp_id,
            result_json: result,
            recommended_vendor_id: result.vendor_id || null,
            generated_at: new Date(),
          },
        });
      }
    }

    // Collect winner of this batch for final round
    batchWinners.push(ai.batch_best);
  }

  const finalPrompt = buildFinalSelectionPrompt(batchWinners);
  const finalResult = await Gemini(finalPrompt);

  const bestProposalId = finalResult?.best_proposal_id;

  //  Store the final best proposal selection
  await prisma.comparisons.create({
    data: {
      rfp_id,
      result_json: finalResult,
      recommended_vendor_id: bestProposalId,
    },
  });

  return {
    message: "Comparison completed",
    best_proposal_id: bestProposalId,
    reason: finalResult?.reason,
  };
}

export async function comparisonExist(rfp_id: string, comparison: comparisons) {
  const proposals = await prisma.proposals.findMany({
    where: {
      rfp_id,
      created_at: {
        gt: comparison.generated_at,
      },
    },
  });

  const rfp = await prisma.rfps.findUnique({
    where: { rfp_id },
  });

  if (proposals.length === 0) {
    return comparison; // need to return proper formatted resp later
  }

  const batches = chunkArray(proposals, 10);

  const batchWinners: any[] = [];

  for (const batch of batches) {
    const prompt = buildBatchComparisonPrompt(rfp, batch);
    const ai = await Gemini(prompt); // Must return JSON

    if (!ai?.batch_best) continue;

    // Save all scores in this batch
    if (Array.isArray(ai.all_scores)) {
      for (const result of ai.all_scores) {
        await prisma.comparisons.create({
          data: {
            rfp_id,
            result_json: result,
            recommended_vendor_id: result.vendor_id || null,
            generated_at: new Date(),
          },
        });
      }
    }

    // Collect winner of this batch for final round
    batchWinners.push(ai.batch_best);
  }

  const finalPrompt = buildFinalSelectionPrompt(batchWinners);
  const finalResult = await Gemini(finalPrompt);

  const bestProposalId = finalResult?.best_proposal_id;

  //  Store the final best proposal selection
  await prisma.comparisons.create({
    data: {
      rfp_id,
      result_json: finalResult,
      recommended_vendor_id: bestProposalId,
    },
  });

  return {
    message: "Comparison completed",
    best_proposal_id: bestProposalId,
    reason: finalResult?.reason,
  };
}

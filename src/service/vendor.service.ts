import { prisma } from "../config/prisma";
import { NotFound, UnprocessableEntity } from "../lib/errors/httpError";
import { buildProposalPrompt, extractRfpUlid, isEmptyResult } from "../lib/helper/helper";
import { Gemini } from "../llm/gemini.llm";
import {
  CreateVendorInput,
  RawVendorEmailInput,
  UpdateVendorInput,
} from "../validators/vendor.validator";

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

export async function deleteById(vendor_id: string) {
  const exists = await prisma.vendors.findUnique({
    where: { vendor_id },
  });

  if (!exists) {
    throw new NotFound("Vendor not found");
  }

  // Soft delete
  await prisma.vendors.update({
    where: { vendor_id },
    data: { is_active: false },
  });

  return true;
}

export async function getById(vendor_id: string) {
  const vendor = await prisma.vendors.findUnique({
    where: {
      vendor_id,
      is_active: true,
    },
  });

  if (!vendor) {
    throw new NotFound("Vendor not found");
  }

  return vendor;
}

export async function processEmail({
  from,
  subject,
  text,
  html,
  attachments,
}: RawVendorEmailInput) {
  // 1. Find vendor by email
  const vendor = await prisma.vendors.findFirst({
    where: { contact_email: from },
  });
  if (!vendor) {
    console.warn(`Vendor not found for email: ${from}`);
    return;
  }

  // 2. Extract RFP ULID from subject
  const rfpVendorId = extractRfpUlid(subject);
  if (!rfpVendorId) {
    console.warn(`No RFP ULID found in subject: ${subject}`);
    return;
  }

  // 3. Find the RFP-Vendor mapping
  const rfpVendor = await prisma.rfp_vendors.findUnique({
    where: { id: rfpVendorId },
    include: { rfps: true, vendors: true },
  });
  if (!rfpVendor) {
    console.warn(`RFP-Vendor mapping not found for ULID: ${rfpVendorId}`);
    return;
  }

  // 4. Store raw email in vendor_emails table
  const vendorEmail = await prisma.vendor_emails.create({
    data: {
      rfp_id: rfpVendor.rfp_id,
      vendor_id: vendor.vendor_id,
      subject,
      email_body_raw: text || html || "",
      attachments: attachments || [],// need to plan later for attachments
      received_at: new Date(),
    },
  });


  const prompt = buildProposalPrompt(text);
 
  const parsed_proposal = await Gemini(prompt);

   if (isEmptyResult(parsed_proposal)) {
     throw new UnprocessableEntity(
       "Structured RFP generation failed — AI returned empty result"
     );
   }

     // 6. Destructure LLM response
  const {
    total_price,
    delivery_days,
    payment_terms,
    warranty,
    completeness_score,
  } = parsed_proposal;

  // 7. Store structured proposal in proposals table
  await prisma.proposals.create({
    data: {
      rfp_id: rfpVendor.rfp_id,
      vendor_id: vendor.vendor_id,
      email_id: vendorEmail.email_id,
      parsed_proposal,
      total_price: total_price ?? null,
      delivery_days: delivery_days ?? null,
      payment_terms: payment_terms ?? null,
      warranty: warranty ?? null,
      completeness_score: completeness_score ?? null,
    },
  });

  

  console.log(`Processed email from ${from} for RFP Vendor ID: ${rfpVendorId}`);
}

import { prisma } from "../config/prisma";
import { NotFound, UnprocessableEntity } from "../lib/errors/httpError";
import { buildRfpPrompt, isEmptyResult } from "../lib/helper/helper";
import { Gemini } from "../llm/gemini.llm";
import { CreateRfpInput } from "../validators/rfp.validator";


export const create = async ({ title, description_raw }: CreateRfpInput) => {

  const prompt = buildRfpPrompt(description_raw);
  const description_structured = await Gemini(prompt);

  if (isEmptyResult(description_structured)) {
    throw new UnprocessableEntity("Structured RFP generation failed — AI returned empty result");
  }


  if (isEmptyResult(description_structured)) {
    throw new UnprocessableEntity("Structured RFP generation failed — AI returned invalid JSON structure");
  }

  const {
    budget = null,
    delivery_timeline = null,
    payment_terms = null,
    warranty = null
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
      description_structured:true
    },
  });

  return rfps;
};


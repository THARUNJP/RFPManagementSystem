import { prisma } from "../config/prisma";
import { UnprocessableEntity } from "../lib/errors/httpError";
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


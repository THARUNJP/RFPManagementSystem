import { NextFunction, Request, Response } from "express";
import * as RFPService from "../service/rfp.service";
import {
  getRfpParamsSchema,
  listRfpsQuerySchema,
  sendRfpParamsSchema,
} from "../validators/rfp.validator";

async function createRfp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { title, description_raw } = req.body;

    const docsRFP = await RFPService.create({ title, description_raw });

    return res.status(200).json({
      status: true,
      message: "RFP created successfully",
      document: docsRFP,
    });
  } catch (err) {
    next(err);
  }
}

export const getRfpById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rfp_id } = getRfpParamsSchema.parse(req.params);

    const rfp = await RFPService.getById(rfp_id);

    return res.status(200).json({
      status: true,
      message: "RFP fetched successfully",
      document: rfp,
    });
  } catch (err) {
    next(err);
  }
};

export const listRfps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = "1", limit = "10" } = listRfpsQuerySchema.parse(req.query);

    const rfps = await RFPService.list(parseInt(page), parseInt(limit));

    return res.status(200).json({
      status: true,
      message: "RFP list fetched successfully",
      documents: rfps,
    });
  } catch (err) {
    next(err);
  }
};

export const sendRfp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rfp_id } = sendRfpParamsSchema.parse(req.params);
    const { vendor_ids } = req.body;

    res.status(202).json({
      status: true,
      rfp_id,
      message: "RFP is being processed and emails will be sent to vendors.",
    });
    setImmediate(async () => {
      await RFPService.send({ rfp_id, vendor_ids }); // updates DB for each vendor
    });
  } catch (err) {
    next(err);
  }
};

export { createRfp };

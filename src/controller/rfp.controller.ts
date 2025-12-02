import { NextFunction, Request, Response } from "express";
import * as RFPService from "../service/rfp.service"

async function createRfp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { title, description_raw } = req.body;

    const docsRFP = await RFPService.create({title,description_raw})

  
    return res.status(200).json({
      status: true,
      message: "RFP created successfully",
      document: docsRFP,
    });
  } catch (err) {
    next(err);
  }
}

export { createRfp };

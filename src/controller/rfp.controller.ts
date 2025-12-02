import { NextFunction, Request, Response } from "express";

async function createRfp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    return res.status(200).json({
      status: true,
      message: "RFP created successfully",
      body:req.body
    });
  } catch (err) {
    next(err);
  }
}

export {createRfp}

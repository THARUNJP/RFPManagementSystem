import { NextFunction, Request, Response } from "express";
import * as VendorService from "../service/vendor.service"


export async function createVendor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { name, contact_email, phone } = req.body;

    const vendor = await VendorService.create({ name, contact_email, phone });

    return res.status(200).json({
      status: true,
      message: "Vendor created successfully",
      document: vendor,
    });
  } catch (err) {
    next(err);
  }
}

import { NextFunction, Request, Response } from "express";
import * as VendorService from "../service/vendor.service"
import { listVendorQuerySchema, rawVendorEmailSchema, vendorIdSchema } from "../validators/vendor.validator";


export async function createVendor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { name, contact_email, phone } = req.body;

    const data = await VendorService.create({ name, contact_email, phone });

    return res.status(200).json({
      status: true,
      message: "Vendor created successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function listVendors(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { page = "1", limit = "10" } = listVendorQuerySchema.parse(req.query);

    const {vendors:data,total} = await VendorService.list(parseInt(page), parseInt(limit));

    return res.status(200).json({
      status: true,
      message: "Vendors fetched successfully",
      data,
      total
    });
  } catch (err) {
    next(err);
  }
}

export async function updateVendor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { vendor_id } = vendorIdSchema.parse(req.params);
    const payload = req.body;

    const data = await VendorService.update(vendor_id, payload);

    return res.status(200).json({
      status: true,
      message: "Vendor updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteVendor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { vendor_id } = vendorIdSchema.parse(req.params);

    await VendorService.deleteById(vendor_id);

    return res.status(200).json({
      status: true,
      message: "Vendor deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function getVendorById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { vendor_id } = vendorIdSchema.parse(req.params);

    const data = await VendorService.getById(vendor_id);

    return res.status(200).json({
      status: true,
      message: "Vendor fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
}

export const handleIncomingVendorEmail = async (email: any) => {
  try {
    // Validate the raw email
    const parsedEmail = rawVendorEmailSchema.parse(email);

    // Call the service layer to process/store the email
    await VendorService.processEmail(parsedEmail);

  } catch (err) {
    console.error("Validation or Processing Error:", err);
  }
};



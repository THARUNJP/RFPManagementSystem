import { validateBody } from "../middelware/validator";
import { CreateRfpSchema } from "./rfp.validator";
import { createVendorSchema, updateVendorSchema } from "./vendor.validator";


export const validators = {
  createRfp: validateBody(CreateRfpSchema),
  createVendor:validateBody(createVendorSchema),
  updateVendor: validateBody(updateVendorSchema),
};
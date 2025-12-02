import { validateBody } from "../middelware/validator";
import { CreateRfpSchema } from "./rfp.validator";





export const validators = {
  createRfp: validateBody(CreateRfpSchema),
};
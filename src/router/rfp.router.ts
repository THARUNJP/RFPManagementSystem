import { Router } from "express";
import { validators } from "../validators/index.validator";
import {
  createRfp,
  getProposals,
  getRfpById,
  getRfpVendors,
  listRfps,
  sendRfp,
  Status,
} from "../controller/rfp.controller";

const router = Router();

router.get("/:rfp_id", getRfpById);
router.get("/", listRfps);
router.post("/", validators.createRfp, createRfp);
router.post("/:rfp_id/send", validators.sendRfp, sendRfp);
router.get("/:rfp_id/vendors", getRfpVendors);
router.get("/:rfp_id/proposal", getProposals);
router.get("/:rfp_id/status", Status);

export default router;

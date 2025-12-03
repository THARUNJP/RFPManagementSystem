import { Router } from "express";
import { validators } from "../validators/index.validator";
import { createRfp, getRfpById, listRfps, sendRfp } from "../controller/rfp.controller";


const router = Router();



router.get("/:rfp_id", getRfpById);
router.get("/", listRfps);
router.post("/", validators.createRfp, createRfp);
router.post("/:rfp_id/send",validators.sendRfp,sendRfp);
router.get("/rfps/:rfp_id/vendors", ()=>{});



export default router;

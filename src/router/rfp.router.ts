import { Router } from "express";
import { validators } from "../validators/index.validator";
import { createRfp, getRfpById, listRfps } from "../controller/rfp.controller";


const router = Router();



router.get("/:rfp_id", getRfpById);
router.get("/", listRfps);
router.post("/", validators.createRfp, createRfp);


export default router;

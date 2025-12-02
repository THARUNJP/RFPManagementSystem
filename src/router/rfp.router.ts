import { Router } from "express";
import { validators } from "../validators/index.validator";
import { createRfp } from "../controller/rfp.controller";


const router = Router();

router.post("/", validators.createRfp, createRfp);


export default router;

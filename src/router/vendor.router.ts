import { Router } from "express";
import { validators } from "../validators/index.validator";
import { createVendor } from "../controller/vendor.controller";

const router = Router();

router.post("/",validators.createVendor,createVendor);
router.get("/", () => {});
router.patch("/:vendor_id", () => {});
router.delete("/:vendor_id", () => {});

export default router;

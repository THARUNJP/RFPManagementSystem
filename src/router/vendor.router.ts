import { Router } from "express";
import { validators } from "../validators/index.validator";
import { createVendor, deleteVendor, getVendorById, listVendors, updateVendor } from "../controller/vendor.controller";

const router = Router();

router.post("/",validators.createVendor,createVendor);
router.get("/",listVendors);
router.get("/:vendor_id",getVendorById)
router.patch("/:vendor_id",validators.updateVendor,updateVendor);
router.delete("/:vendor_id",deleteVendor);

export default router;

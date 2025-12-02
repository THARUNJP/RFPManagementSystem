import { Router } from "express";
import rfpRouter from "./rfp.router";
import vendorRouter from "./vendor.router"

const router = Router();



router.use("/rfp",rfpRouter)
router.use("/vendor",vendorRouter)







export default router
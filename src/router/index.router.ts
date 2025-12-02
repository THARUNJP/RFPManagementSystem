import { Router } from "express";
import rfpRouter from "./rfp.router";

const router = Router();



router.use("/rfp",rfpRouter)







export default router
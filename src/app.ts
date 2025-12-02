import express, { Application } from "express";
import cors from "cors"
import router from "./router/index.router";
import { errorHandler } from "./middelware/errorHandler";
import { healthz } from "./controller/health.controller";
// import helmet from "helmet"
// import { limiter, timeoutMiddleware } from "./middleware/timeoutMiddleware";



const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use(requestIdMiddleware)
// app.use(limiter)
// app.use(timeoutMiddleware)
// app.use(helmet())


app.use("/api/v1",router)
// Health check route
app.get("/healthz",healthz);

app.use(errorHandler)


export default app;
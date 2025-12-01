import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { appEnv } from "./config/env";


const PORT = appEnv.port || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
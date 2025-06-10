import express from "express";
import { errorHandler } from "./middlewares/globalErrorHandler";
import connectDB from "./config/database";
import "dotenv/config";

const app = express();
app.use(express.json());
connectDB();

app.use(errorHandler);

export default app;

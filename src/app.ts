import express from "express";
import { errorHandler } from "./middlewares/globalErrorHandler";
import connectDB from "./config/database";
import "dotenv/config";
const dashboardRoute = require("./routes/dashboard/dashboard")

const app = express();
app.use(express.json());
connectDB();

app.use(errorHandler);

app.use('/api/dashboard', dashboardRoute);

export default app;

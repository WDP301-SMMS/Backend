import HealthHistoryController from "@/controllers/health-history/health.history.controller";
import { Router } from "express";

const router = Router();
const healthHistoryController = new HealthHistoryController();

router.get(
  '/students/:studentId',
  healthHistoryController.getStudentHealthHistory,
);

export default router;
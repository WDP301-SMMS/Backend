import { DashboardController } from "@/controllers/dashboard/dashboard.controller";

const express = require('express');


const router = express.Router();


// GET /api/v1/dashboard/admin
router.get('/admin', DashboardController.getAdminDashboard);

export default router;
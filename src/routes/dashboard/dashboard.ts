import { DashboardController } from '@/controllers/dashboard/dashboard.controller';
import { Router } from 'express';


const router = Router();

// GET /api/v1/dashboard/admin
router.get('/admin', DashboardController.getAdminDashboard);

export default router;
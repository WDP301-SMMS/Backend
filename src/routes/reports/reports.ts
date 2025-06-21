import { ReportController } from '@/controllers/report.controller';
const express = require('express');
const router = express.Router();


const reportController = new ReportController();


router.get(
    '/students/:studentId/vaccination-history',
    // authMiddleware,
    // ownershipMiddleware, // Middleware này sẽ kiểm tra: Nếu role là Parent, studentId có phải con họ không.
    reportController.getStudentVaccinationHistory
);


router.get(
    '/campaigns/:campaignId/full-report',
    // authMiddleware,
    // roleMiddleware([RoleEnum.Admin, RoleEnum.Nurse]),
    reportController.getCampaignFullReport
);


router.get(
    '/dashboard/vaccination-stats',
    // authMiddleware,
    // roleMiddleware([RoleEnum.Admin, RoleEnum.Nurse]),
    reportController.getDashboardStats
);


export default router;
import express from 'express';
import { authRouter } from './auth/auth.routes';
import dashboardRouter from './dashboard/dashboard';
import vaccinationCampaigns from './vaccine/vaccine'
const router = express.Router();

router.use('/auth', authRouter);
router.use('/admin', dashboardRouter);
router.use('/vaccinationCampaigns', vaccinationCampaigns);

export default router;

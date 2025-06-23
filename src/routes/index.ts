import express from 'express';
import { authRouter } from './auth/auth.routes';
import dashboardRouter from './dashboard/dashboard';
import vaccinationCampaigns from './vaccine/vaccine';
import reportsRouter from './reports/reports';
import medicationRequestRouter from './medicationRequest/medication';
import upload from './upload/upload';
import {
  handleToken,
  roleBaseAccess,
} from '@/middlewares/security/authorization';
import { RoleEnum } from '@/enums/RoleEnum';
import userRouter from './user/user';
import healthCheckRouter from './health-check';
const router = express.Router();

router.use('/auth', authRouter);
router.use(
  '/admin',
  handleToken,
  roleBaseAccess([RoleEnum.Admin]),
  dashboardRouter,
);
router.use('/user', handleToken, userRouter);
router.use('/medication', medicationRequestRouter);
router.use('/upload', upload);
router.use('/vaccinationCampaigns', vaccinationCampaigns);
router.use('reports', reportsRouter);
router.use('/vaccinationCampaigns', handleToken, vaccinationCampaigns);
router.use('/reports', reportsRouter);
router.use(
  '/health-check',
  handleToken,
  roleBaseAccess([RoleEnum.Admin]),
  healthCheckRouter,
);

export default router;

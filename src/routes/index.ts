import express from 'express';
import { authRouter } from './auth/auth.routes';
import dashboardRouter from './dashboard/dashboard';
import vaccinationCampaigns from './vaccine/vaccine';
import reportsRouter from './reports/reports';
import medicationRequestRouter from './medicationRequest/medication';
import medicalIncident from './incident/incident';
import upload from './upload/upload';
import healthProfileRouter from './health-profile/health.profile';
import inventoryRouter from './inventory/inventory';
import healthHistoryRouter from './health-history/health.history';
import appointmentRouter from './appointment/appointment';
import {
  handleToken,
  roleBaseAccess,
} from '@/middlewares/security/authorization';
import { RoleEnum } from '@/enums/RoleEnum';
import userRouter from './user/user';
import healthCheckRouter from './health-check';
import notificationRouter from './notifications/notifications';
import tokenNotificationRouter from './notifications/token.notification';
const router = express.Router();

router.use('/auth', authRouter);
router.use(
  '/admin',
  handleToken,
  // roleBaseAccess([RoleEnum.Admin]),
  dashboardRouter,
);
router.use('/user', handleToken, userRouter);
router.use('/medication', handleToken, medicationRequestRouter);
router.use('/incident', handleToken, medicalIncident);
router.use('/upload', upload);
router.use('/vaccinationCampaigns', handleToken, vaccinationCampaigns);
router.use('/reports', reportsRouter);
router.use('/health-profiles', handleToken, healthProfileRouter);
router.use(
  '/health-history',
  handleToken,
  roleBaseAccess([RoleEnum.Parent]),
  healthHistoryRouter,
);
router.use('/health-check', handleToken, healthCheckRouter);
router.use('/inventory', handleToken, inventoryRouter);
router.use('/appointments', handleToken, appointmentRouter);
router.use('/notifications', handleToken, notificationRouter);
router.use('/token-notifications', handleToken, tokenNotificationRouter);

export default router;

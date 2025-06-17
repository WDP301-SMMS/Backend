import express from 'express';
import { authRouter } from './auth/auth.routes';
import dashboardRouter from './dashboard/dashboard';
const router = express.Router();

router.use('/auth', authRouter);
router.use('/admin', dashboardRouter);

export default router;

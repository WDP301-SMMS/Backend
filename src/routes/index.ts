import express from 'express';
import { authRouter } from './auth/auth.routes';
import dashboardRouter from './dashboard/dashboard';
import {
  handleToken,
  roleBaseAccess,
} from '@/middlewares/security/authorization';
import { RoleEnum } from '@/enums/RoleEnum';
import userRouter from './user/user';
const router = express.Router();

router.use('/auth', authRouter);
router.use(
  '/admin',
  handleToken,
  roleBaseAccess([RoleEnum.Admin]),
  dashboardRouter,
);
router.use('/user', handleToken, userRouter);

export default router;

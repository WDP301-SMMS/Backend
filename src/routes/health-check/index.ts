import express from 'express';
import templateRouter from './template';
import campaignRouter from './campaign';
import recordRouter from './record';
import { roleBaseAccess } from '@/middlewares/security/authorization';
import { RoleEnum } from '@/enums/RoleEnum';

const healthCheckRouter = express.Router();

healthCheckRouter.use(
  '/templates',
  roleBaseAccess([RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Nurse]),
  templateRouter,
);
healthCheckRouter.use(
  '/campaigns',
  roleBaseAccess([RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Nurse]),
  campaignRouter,
);
healthCheckRouter.use(
  '/record',
  roleBaseAccess([RoleEnum.Parent]),
  recordRouter,
);

export default healthCheckRouter;

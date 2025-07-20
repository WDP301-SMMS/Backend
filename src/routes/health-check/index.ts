import express from 'express';
import templateRouter from './template';
import campaignRouter from './campaign';
import recordRouter from './record';
import consentRouter from './consent';
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
  '/consents',
  roleBaseAccess([RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Nurse, RoleEnum.Parent]),
  consentRouter,
);
healthCheckRouter.use(
  '/record',
  recordRouter,
);

export default healthCheckRouter;

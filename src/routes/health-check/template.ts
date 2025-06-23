import express from 'express';
import {
  createHealthCheckTemplate,
  deleteHealthCheckTemplate,
  getAllHealthCheckTemplates,
  getHealthCheckTemplate,
  setDefaultForHealthCheckTemplate,
  updateHealthCheckTemplate,
} from '@/controllers/health-check/health-check-template.controller';
import { templateValidator } from '@/validators/health-check/health.check.template.validator';

const templateRouter = express.Router();

templateRouter
  .route('/')
  .get(getAllHealthCheckTemplates)
  .post(templateValidator, createHealthCheckTemplate);

templateRouter
  .route('/:id')
  .get(getHealthCheckTemplate)
  .put(templateValidator, updateHealthCheckTemplate)
  .delete(deleteHealthCheckTemplate);

templateRouter.post('/set-default', setDefaultForHealthCheckTemplate);

export default templateRouter;

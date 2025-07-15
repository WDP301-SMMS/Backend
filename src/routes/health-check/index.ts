import express from 'express';
import templateRouter from './template';
import campaignRouter from './campaign';

const healthCheckRouter = express.Router();

healthCheckRouter.use('/templates', templateRouter);
healthCheckRouter.use('/campaigns', campaignRouter);

export default healthCheckRouter;